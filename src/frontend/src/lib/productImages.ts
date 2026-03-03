export const PRODUCT_IMAGES: Record<string, string> = {
  "Car Wash Shampoo":
    "/assets/generated/product-car-wash-shampoo.dim_400x400.png",
  "Auto Rinse Wash":
    "/assets/generated/product-auto-rinse-wash.dim_400x400.png",
  "PVR Polish": "/assets/generated/product-pvr-polish.dim_400x400.png",
  "Tire Shine": "/assets/generated/product-tire-shine.dim_400x400.png",
  "Interior Cleaner":
    "/assets/generated/product-interior-cleaner.dim_400x400.png",
  "Microfiber Towels":
    "/assets/generated/product-microfiber-towels.dim_400x400.png",
  "Car Wax": "/assets/generated/product-car-wax.dim_400x400.png",
  "Glass Cleaner": "/assets/generated/product-glass-cleaner.dim_400x400.png",
};

export function getProductImage(name: string): string {
  return (
    PRODUCT_IMAGES[name] ||
    "/assets/generated/product-car-wash-shampoo.dim_400x400.png"
  );
}

export function formatPrice(cents: bigint): string {
  const dollars = Number(cents) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}

export function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(ms));
}

export const CATEGORIES = [
  "All",
  "Washing",
  "Polishing",
  "Interior",
  "Accessories",
] as const;
export type Category = (typeof CATEGORIES)[number];

export function getCategoryBadgeClass(category: string): string {
  switch (category.toLowerCase()) {
    case "washing":
      return "badge-washing";
    case "polishing":
      return "badge-polishing";
    case "interior":
      return "badge-interior";
    case "accessories":
      return "badge-accessories";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}
