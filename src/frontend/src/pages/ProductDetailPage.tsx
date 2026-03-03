import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddToCart, useProduct } from "../hooks/useQueries";
import {
  formatPrice,
  getCategoryBadgeClass,
  getProductImage,
} from "../lib/productImages";

export function ProductDetailPage() {
  const { id } = useParams({ from: "/product/$id" });
  const productId = BigInt(id);
  const { data: product, isLoading } = useProduct(productId);
  const { identity, login } = useInternetIdentity();
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <main className="flex-1 pt-24 pb-16">
        <div
          className="container mx-auto px-4"
          data-ocid="product.loading_state"
        >
          <Skeleton className="h-6 w-32 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-xl w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4" data-ocid="product.error_state">
          <div className="text-center py-20">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Product Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              This product doesn't exist or has been removed.
            </p>
            <Link to="/shop">
              <Button data-ocid="product.back.button">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const inStock = Number(product.stock) > 0;
  const maxQty = Math.min(10, Number(product.stock));

  const handleAddToCart = async () => {
    if (!identity) {
      toast.info("Please sign in to add items to your cart");
      login();
      return;
    }
    if (!inStock) return;

    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: BigInt(quantity),
      });
      setAdded(true);
      toast.success(`${product.name} added to cart`);
      setTimeout(() => setAdded(false), 2500);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <main className="flex-1 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link to="/shop">
            <Button
              variant="ghost"
              size="sm"
              data-ocid="product.back.button"
              className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-xl overflow-hidden aspect-square bg-secondary/20 border border-border/50">
              <img
                src={getProductImage(product.name)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {!inStock && (
                <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                  <span className="text-sm font-semibold text-muted-foreground bg-card/80 px-4 py-2 rounded-full border border-border/50">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-5"
          >
            <div>
              <Badge
                variant="outline"
                className={`mb-3 text-xs ${getCategoryBadgeClass(product.category)}`}
              >
                {product.category}
              </Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {inStock ? (
                <div className="flex items-center gap-1.5 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    In Stock ({product.stock.toString()} units)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed text-base">
              {product.description}
            </p>

            <div className="border-t border-border/50 pt-5">
              {/* Quantity Selector */}
              {inStock && (
                <div className="mb-5">
                  <label
                    htmlFor="quantity-display"
                    className="text-sm font-medium text-foreground block mb-2"
                  >
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      data-ocid="product.quantity.decrease.button"
                      className="h-10 w-10 border-border/50"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span
                      id="quantity-display"
                      className="text-xl font-bold w-8 text-center text-foreground"
                      data-ocid="product.quantity.input"
                    >
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity((q) => Math.min(maxQty, q + 1))
                      }
                      disabled={quantity >= maxQty}
                      data-ocid="product.quantity.increase.button"
                      className="h-10 w-10 border-border/50"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Max: {maxQty}
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <Button
                size="lg"
                disabled={!inStock || addToCart.isPending}
                onClick={handleAddToCart}
                data-ocid="product.add_to_cart.button"
                className={`w-full gap-2 text-base transition-all ${
                  added
                    ? "bg-green-600 hover:bg-green-600"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground electric-glow"
                }`}
              >
                {addToCart.isPending ? (
                  "Adding…"
                ) : added ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>

              {!inStock && (
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  This product is currently unavailable
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
