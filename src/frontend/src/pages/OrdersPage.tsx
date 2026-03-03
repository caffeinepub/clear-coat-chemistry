import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardList, Package } from "lucide-react";
import { motion } from "motion/react";
import { AuthWall } from "../components/AuthWall";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyOrders } from "../hooks/useQueries";
import { formatDate, formatPrice } from "../lib/productImages";

function getStatusVariant(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-900/50 text-yellow-300 border-yellow-700/50";
    case "processing":
      return "bg-blue-900/50 text-blue-300 border-blue-700/50";
    case "shipped":
      return "bg-purple-900/50 text-purple-300 border-purple-700/50";
    case "delivered":
      return "bg-green-900/50 text-green-300 border-green-700/50";
    case "cancelled":
      return "bg-red-900/50 text-red-300 border-red-700/50";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

export function OrdersPage() {
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading } = useMyOrders();

  if (!identity) {
    return (
      <main className="flex-1 pt-24 pb-16">
        <AuthWall message="Sign in to view your order history." />
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
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            My Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your orders
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4" data-ocid="orders.loading_state">
            {["sk1", "sk2", "sk3"].map((sk) => (
              <div
                key={sk}
                className="rounded-xl bg-card border border-border/50 p-5"
              >
                <div className="flex justify-between items-start mb-4">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
            data-ocid="orders.empty_state"
          >
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              No orders yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Link to="/shop">
              <Button
                data-ocid="orders.shop.button"
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders
              .slice()
              .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
              .map((order, index) => (
                <motion.div
                  key={order.id.toString()}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  data-ocid={`orders.item.${index + 1}`}
                  className="rounded-xl bg-card border border-border/50 p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          Order #{order.id.toString()}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${getStatusVariant(order.status)}`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-primary">
                        {formatPrice(order.total)}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="rounded-lg bg-secondary/30 p-3 space-y-1.5">
                    {order.items.map((item) => (
                      <div
                        key={item.productId.toString()}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.productName} × {item.quantity.toString()}
                        </span>
                        <span className="text-foreground font-medium">
                          {formatPrice(
                            BigInt(Number(item.price) * Number(item.quantity)),
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </div>
    </main>
  );
}
