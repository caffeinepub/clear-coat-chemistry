import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { AuthWall } from "../components/AuthWall";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllProducts,
  useCart,
  useRemoveFromCart,
  useUpdateCartItem,
} from "../hooks/useQueries";
import { formatPrice } from "../lib/productImages";
import { getProductImage } from "../lib/productImages";

export function CartPage() {
  const { identity } = useInternetIdentity();
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  if (!identity) {
    return (
      <main className="flex-1 pt-24 pb-16">
        <AuthWall message="Sign in to view your cart and start shopping." />
      </main>
    );
  }

  const isLoading = cartLoading || productsLoading;

  const cartWithDetails = (cartItems || []).map((item) => {
    const product = (products || []).find((p) => p.id === item.productId);
    return { ...item, product };
  });

  const total = cartWithDetails.reduce((sum, item) => {
    return (
      sum +
      (item.product ? Number(item.product.price) * Number(item.quantity) : 0)
    );
  }, 0);

  const handleUpdateQuantity = async (productId: bigint, newQty: number) => {
    if (newQty < 1) return;
    try {
      await updateItem.mutateAsync({
        productId,
        quantity: BigInt(newQty),
      });
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (productId: bigint, name: string) => {
    try {
      await removeItem.mutateAsync({ productId });
      toast.success(`${name} removed from cart`);
    } catch {
      toast.error("Failed to remove item");
    }
  };

  return (
    <main className="flex-1 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-primary" />
            Shopping Cart
          </h1>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4" data-ocid="cart.loading_state">
            {["sk1", "sk2", "sk3"].map((sk) => (
              <div
                key={sk}
                className="flex gap-4 p-4 rounded-lg bg-card border border-border/50"
              >
                <Skeleton className="w-24 h-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : cartWithDetails.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
            data-ocid="cart.empty_state"
          >
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Add some products to get started
            </p>
            <Link to="/shop">
              <Button
                data-ocid="cart.shop.button"
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <ShoppingBag className="h-4 w-4" />
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {cartWithDetails.map((item, index) => (
                  <motion.div
                    key={item.productId.toString()}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    data-ocid={`cart.item.${index + 1}`}
                    className="flex gap-4 p-4 rounded-lg bg-card border border-border/50"
                  >
                    {/* Product image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-secondary/30">
                      {item.product && (
                        <img
                          src={getProductImage(item.product.name)}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {item.product?.name ?? `Product #${item.productId}`}
                      </h3>
                      <p className="text-primary font-bold mt-0.5">
                        {item.product ? formatPrice(item.product.price) : "—"}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-border/50"
                            disabled={
                              Number(item.quantity) <= 1 || updateItem.isPending
                            }
                            onClick={() =>
                              handleUpdateQuantity(
                                item.productId,
                                Number(item.quantity) - 1,
                              )
                            }
                            data-ocid={`cart.decrease.button.${index + 1}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold text-sm text-foreground">
                            {item.quantity.toString()}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-border/50"
                            disabled={updateItem.isPending}
                            onClick={() =>
                              handleUpdateQuantity(
                                item.productId,
                                Number(item.quantity) + 1,
                              )
                            }
                            data-ocid={`cart.increase.button.${index + 1}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Item total & remove */}
                        <div className="flex items-center gap-3">
                          {item.product && (
                            <span className="text-sm font-semibold text-foreground">
                              {formatPrice(
                                BigInt(
                                  Number(item.product.price) *
                                    Number(item.quantity),
                                ),
                              )}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              handleRemove(
                                item.productId,
                                item.product?.name ?? "Item",
                              )
                            }
                            disabled={removeItem.isPending}
                            data-ocid={`cart.delete_button.${index + 1}`}
                          >
                            {removeItem.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 rounded-xl bg-card border border-border/50 p-6">
                <h2 className="font-display font-bold text-lg text-foreground mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 mb-4">
                  {cartWithDetails.map((item) => (
                    <div
                      key={item.productId.toString()}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground truncate max-w-[160px]">
                        {item.product?.name} × {item.quantity.toString()}
                      </span>
                      <span className="text-foreground font-medium">
                        {item.product
                          ? formatPrice(
                              BigInt(
                                Number(item.product.price) *
                                  Number(item.quantity),
                              ),
                            )
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4 bg-border/50" />
                <div className="flex justify-between font-bold text-lg mb-6">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">
                    {formatPrice(BigInt(total))}
                  </span>
                </div>
                <Link to="/checkout">
                  <Button
                    className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground electric-glow"
                    size="lg"
                    data-ocid="cart.checkout.button"
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button
                    variant="ghost"
                    className="w-full mt-2 text-muted-foreground hover:text-foreground"
                    data-ocid="cart.continue_shopping.button"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
