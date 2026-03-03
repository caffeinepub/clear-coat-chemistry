import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Package,
  ShoppingBag,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthWall } from "../components/AuthWall";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllProducts, useCart, usePlaceOrder } from "../hooks/useQueries";
import { formatPrice } from "../lib/productImages";
import { getProductImage } from "../lib/productImages";

export function CheckoutPage() {
  const { identity } = useInternetIdentity();

  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const placeOrder = usePlaceOrder();
  const [orderId, setOrderId] = useState<bigint | null>(null);

  if (!identity) {
    return (
      <main className="flex-1 pt-24 pb-16">
        <AuthWall message="Sign in to complete your checkout." />
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

  const handlePlaceOrder = async () => {
    if (cartWithDetails.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const id = await placeOrder.mutateAsync();
      setOrderId(id);
      toast.success("Order placed successfully!");
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (orderId !== null) {
    return (
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto text-center py-12"
            data-ocid="checkout.success_state"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="h-10 w-10 text-green-400" />
            </motion.div>

            <h1 className="font-display text-3xl font-bold text-foreground mb-3">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground mb-2">
              Thank you for your purchase.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Order ID:{" "}
              <span className="font-mono text-primary font-semibold">
                #{orderId.toString()}
              </span>
            </p>

            <div className="bg-card border border-border/50 rounded-xl p-4 mb-8 text-left">
              <h3 className="font-semibold text-foreground mb-2 text-sm">
                What's next?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary shrink-0" />
                  Your order is being processed
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  You can track it in My Orders
                </li>
              </ul>
            </div>

            <div className="flex gap-3 justify-center">
              <Link to="/orders">
                <Button
                  data-ocid="checkout.view_orders.button"
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  View My Orders
                </Button>
              </Link>
              <Link to="/shop">
                <Button
                  variant="outline"
                  data-ocid="checkout.continue_shopping.button"
                  className="gap-2 border-border/50"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link to="/cart">
            <Button
              variant="ghost"
              size="sm"
              data-ocid="checkout.back.button"
              className="gap-2 text-muted-foreground hover:text-foreground -ml-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Checkout
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="font-display font-bold text-xl text-foreground mb-4">
              Order Summary
            </h2>

            {isLoading ? (
              <div className="space-y-4" data-ocid="checkout.loading_state">
                {["sk1", "sk2", "sk3"].map((sk) => (
                  <div
                    key={sk}
                    className="flex gap-3 p-3 rounded-lg bg-card border border-border/50"
                  >
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : cartWithDetails.length === 0 ? (
              <div
                className="text-center py-10 bg-card rounded-xl border border-border/50"
                data-ocid="checkout.empty_state"
              >
                <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Link to="/shop">
                  <Button
                    variant="outline"
                    data-ocid="checkout.shop.button"
                    className="border-border/50"
                  >
                    Go Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
                <div className="divide-y divide-border/50">
                  {cartWithDetails.map((item, index) => (
                    <div
                      key={item.productId.toString()}
                      className="flex gap-3 p-4"
                      data-ocid={`checkout.item.${index + 1}`}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-secondary/30">
                        {item.product && (
                          <img
                            src={getProductImage(item.product.name)}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm truncate">
                          {item.product?.name ?? `Product #${item.productId}`}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Qty: {item.quantity.toString()}
                        </p>
                      </div>
                      <div className="shrink-0 text-sm font-semibold text-foreground">
                        {item.product
                          ? formatPrice(
                              BigInt(
                                Number(item.product.price) *
                                  Number(item.quantity),
                              ),
                            )
                          : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Payment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="font-display font-bold text-xl text-foreground mb-4">
              Total
            </h2>
            <div className="rounded-xl bg-card border border-border/50 p-6">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({cartWithDetails.length} items)
                  </span>
                  <span className="text-foreground font-medium">
                    {formatPrice(BigInt(total))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-400 font-medium">Free</span>
                </div>
              </div>
              <Separator className="my-4 bg-border/50" />
              <div className="flex justify-between font-bold text-xl mb-6">
                <span className="text-foreground">Total</span>
                <span className="text-primary">
                  {formatPrice(BigInt(total))}
                </span>
              </div>
              <Button
                size="lg"
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground electric-glow"
                onClick={handlePlaceOrder}
                disabled={
                  placeOrder.isPending ||
                  cartWithDetails.length === 0 ||
                  isLoading
                }
                data-ocid="checkout.place_order.button"
              >
                {placeOrder.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Placing Order…
                  </>
                ) : (
                  <>
                    <Package className="h-5 w-5" />
                    Place Order
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Secured by Internet Computer Protocol
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
