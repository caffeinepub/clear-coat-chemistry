import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddToCart } from "../hooks/useQueries";
import {
  formatPrice,
  getCategoryBadgeClass,
  getProductImage,
} from "../lib/productImages";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { identity, login } = useInternetIdentity();
  const addToCart = useAddToCart();
  const [added, setAdded] = useState(false);
  const inStock = Number(product.stock) > 0;

  const handleAddToCart = async () => {
    if (!identity) {
      toast.info("Please sign in to add items to your cart");
      login();
      return;
    }
    if (!inStock) return;

    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: 1n });
      setAdded(true);
      toast.success(`${product.name} added to cart`);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="card-hover rounded-lg overflow-hidden bg-card border border-border/50 flex flex-col group"
    >
      {/* Product image */}
      <Link to="/product/$id" params={{ id: product.id.toString() }}>
        <div className="relative overflow-hidden aspect-square bg-secondary/30">
          <img
            src={getProductImage(product.name)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {!inStock && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="text-sm font-semibold text-muted-foreground bg-card/80 px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Card content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            to="/product/$id"
            params={{ id: product.id.toString() }}
            className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>
        </div>

        <Badge
          variant="outline"
          className={`self-start text-xs ${getCategoryBadgeClass(product.category)}`}
        >
          {product.category}
        </Badge>

        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {inStock ? (
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">In Stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-0.5">
                <AlertCircle className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          <Button
            size="sm"
            disabled={!inStock || addToCart.isPending}
            onClick={handleAddToCart}
            data-ocid="product.add_button"
            className={`gap-1.5 transition-all ${
              added
                ? "bg-green-600 hover:bg-green-600"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            {added ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
