import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization (always first non-import statement due to with-clause)
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    imageUrl : Text;
    stock : Nat;
    featured : Bool;
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  type OrderItem = {
    productId : Nat;
    productName : Text;
    price : Nat;
    quantity : Nat;
  };

  type Order = {
    id : Nat;
    buyer : Principal;
    items : [OrderItem];
    total : Nat;
    status : Text;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  // State Variables
  var nextProductId = 1;
  var nextOrderId = 1;

  let products = Map.empty<Nat, Product>();
  let carts = Map.empty<Principal, [CartItem]>();
  let orders = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management (Admin Only)
  public shared ({ caller }) func addProduct(product : Product) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };

    let newProduct : Product = {
      product with
      id = nextProductId;
    };
    products.add(nextProductId, newProduct);
    nextProductId += 1;
    newProduct.id;
  };

  public shared ({ caller }) func updateProduct(id : Nat, product : Product) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let updatedProduct : Product = {
          product with
          id
        };
        products.add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };

    if (not products.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    products.remove(id);
  };

  public query ({ caller }) func getProduct(id : Nat) : async ?Product {
    products.get(id);
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getFeaturedProducts() : async [Product] {
    products.values().toArray().filter(func(p) { p.featured });
  };

  // Cart Management (Authenticated Users)
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage cart");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        if (quantity > product.stock) {
          Runtime.trap("Insufficient stock");
        };

        let cart = getCartForUserInternal(caller);
        var updated = false;
        let newCart = cart.map(
          func(item) {
            if (item.productId == productId) {
              updated := true;
              { productId; quantity = item.quantity + quantity };
            } else {
              item;
            };
          }
        );

        carts.add(caller, if (updated) { newCart } else { newCart.concat([{ productId; quantity }]) });
      };
    };
  };

  public shared ({ caller }) func updateCartItem(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage cart");
    };

    let cart = getCartForUserInternal(caller);
    let updatedCart = cart.map(
      func(item) {
        if (item.productId == productId) {
          { productId; quantity };
        } else {
          item;
        };
      }
    );
    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage cart");
    };

    let cart = getCartForUserInternal(caller);
    let filteredCart = cart.filter(func(item) { item.productId != productId });
    carts.add(caller, filteredCart);
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage cart");
    };

    carts.add(caller, []);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    getCartForUserInternal(caller);
  };

  // Order Management
  public shared ({ caller }) func placeOrder() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let cart = getCartForUserInternal(caller);
    if (cart.size() == 0) {
      Runtime.trap("Cart is empty");
    };

    var total = 0;
    let orderItems = cart.map(
      func(item) {
        switch (products.get(item.productId)) {
          case (null) {
            Runtime.trap("Product not found");
          };
          case (?product) {
            if (item.quantity > product.stock) {
              Runtime.trap("Insufficient stock for product " # product.name);
            };
            total += product.price * item.quantity;
            {
              productId = product.id;
              productName = product.name;
              price = product.price;
              quantity = item.quantity;
            };
          };
        };
      }
    );

    let order : Order = {
      id = nextOrderId;
      buyer = caller;
      items = orderItems;
      total;
      status = "pending";
      createdAt = Time.now();
    };

    orders.add(nextOrderId, order);
    nextOrderId += 1;

    // Update product stock
    for (item in cart.values()) {
      switch (products.get(item.productId)) {
        case (?product) {
          products.add(
            product.id,
            {
              product with
              stock = if (item.quantity > product.stock) { 0 } else { product.stock - item.quantity };
            },
          );
        };
        case (_) {};
      };
    };

    carts.add(caller, []);
    order.id;
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    orders.values().toArray().filter(func(o) { o.buyer == caller });
  };

  public query ({ caller }) func getOrder(id : Nat) : async ?Order {
    switch (orders.get(id)) {
      case (null) { null };
      case (?order) {
        // Only the order owner or admins can view the order
        if (order.buyer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };

    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        orders.add(
          id,
          { order with status }
        );
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    orders.values().toArray();
  };

  func getCartForUserInternal(user : Principal) : [CartItem] {
    switch (carts.get(user)) {
      case (null) { [] };
      case (?cart) { cart };
    };
  };

  // Sample Data Initialization
  public shared ({ caller }) func initializeSamples() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };

    products.clear();
    let samples = [
      {
        id = 1;
        name = "Car Shampoo";
        description = "High-foaming car wash shampoo";
        price = 1299;
        category = "Cleaning";
        imageUrl = "car-shampoo.jpg";
        stock = 50;
        featured = true;
      },
      {
        id = 2;
        name = "Tire Cleaner";
        description = "Removes tough dirt from tires";
        price = 899;
        category = "Wheels";
        imageUrl = "tire-cleaner.jpg";
        stock = 40;
        featured = false;
      },
      {
        id = 3;
        name = "Wax Polish";
        description = "Gives cars a glossy finish";
        price = 1599;
        category = "Polish";
        imageUrl = "wax-polish.jpg";
        stock = 30;
        featured = true;
      },
      {
        id = 4;
        name = "Interior Cleaner";
        description = "Safe for all car interiors";
        price = 1199;
        category = "Interior";
        imageUrl = "interior-cleaner.jpg";
        stock = 25;
        featured = false;
      },
      {
        id = 5;
        name = "Glass Cleaner";
        description = "Streak-free glass cleaning";
        price = 699;
        category = "Glass";
        imageUrl = "glass-cleaner.jpg";
        stock = 35;
        featured = true;
      },
      {
        id = 6;
        name = "Leather Conditioner";
        description = "Softens and protects leather";
        price = 2099;
        category = "Leather";
        imageUrl = "leather-conditioner.jpg";
        stock = 20;
        featured = false;
      },
      {
        id = 7;
        name = "Wheel Brush";
        description = "Durable wheel cleaning brush";
        price = 400;
        category = "Wheels";
        imageUrl = "wheel-brush.jpg";
        stock = 100;
        featured = true;
      },
      {
        id = 8;
        name = "Microfiber Cloth";
        description = "Ultra-soft cleaning cloth";
        price = 399;
        category = "Accessories";
        imageUrl = "microfiber-cloth.jpg";
        stock = 200;
        featured = false;
      },
    ];

    for (sample in samples.values()) {
      products.add(sample.id, sample);
    };

    nextProductId := 9;
  };
};

