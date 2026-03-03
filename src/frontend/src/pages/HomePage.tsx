import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
  Droplets,
  Layers,
  Sparkles,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import { useFeaturedProducts } from "../hooks/useQueries";

const categories = [
  {
    name: "Washing",
    icon: Droplets,
    description: "Shampoos, rinses & wash solutions",
    color: "text-blue-400",
    bg: "bg-blue-950/40 border-blue-800/40",
    link: "/shop" as const,
  },
  {
    name: "Polishing",
    icon: Sparkles,
    description: "Wax, polish & paint protection",
    color: "text-yellow-400",
    bg: "bg-yellow-950/40 border-yellow-800/40",
    link: "/shop" as const,
  },
  {
    name: "Interior",
    icon: Layers,
    description: "Cleaners & fresheners",
    color: "text-green-400",
    bg: "bg-green-950/40 border-green-800/40",
    link: "/shop" as const,
  },
  {
    name: "Accessories",
    icon: Wrench,
    description: "Towels, applicators & tools",
    color: "text-purple-400",
    bg: "bg-purple-950/40 border-purple-800/40",
    link: "/shop" as const,
  },
];

export function HomePage() {
  const { data: featuredProducts, isLoading } = useFeaturedProducts();

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section
        data-ocid="hero.section"
        className="relative min-h-[85vh] flex items-center overflow-hidden"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-banner.dim_1200x500.jpg"
            alt="Premium auto care"
            className="w-full h-full object-cover object-center"
          />
          <div className="hero-gradient absolute inset-0" />
          <div className="absolute inset-0 bg-background/40" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.62 0.22 240) 1px, transparent 1px), linear-gradient(90deg, oklch(0.62 0.22 240) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-6 border border-primary/30 rounded-full px-4 py-1.5 bg-primary/10"
            >
              <Sparkles className="h-3 w-3" />
              Professional Grade Chemistry
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-none tracking-tight mb-6"
            >
              Premium <span className="text-gradient">Clear Coat</span>
              <br />
              Chemistry
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed"
            >
              Professional-grade detailing products trusted by enthusiasts
              worldwide. From wash shampoos to ceramic coatings — give your car
              the care it deserves.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/shop">
                <Button
                  size="lg"
                  data-ocid="hero.shop_now.button"
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground electric-glow text-base px-8"
                >
                  Shop Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/shop">
                <Button
                  size="lg"
                  variant="outline"
                  data-ocid="hero.explore.button"
                  className="gap-2 border-border/70 hover:bg-secondary text-base"
                >
                  Explore Collections
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground/50"
        >
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-muted-foreground/30" />
          <ChevronRight className="h-4 w-4 rotate-90" />
        </motion.div>
      </section>

      {/* Categories Section */}
      <section data-ocid="categories.section" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Find exactly what your vehicle needs with our curated product
              lines
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link to={cat.link} data-ocid="category.card">
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`rounded-xl p-6 border ${cat.bg} hover:border-${cat.color.split("-")[1]}-600/60 transition-all duration-300 cursor-pointer group`}
                  >
                    <cat.icon
                      className={`h-8 w-8 ${cat.color} mb-3 group-hover:scale-110 transition-transform`}
                    />
                    <h3 className="font-semibold text-foreground mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {cat.description}
                    </p>
                    <div
                      className={`flex items-center gap-1 mt-3 text-xs ${cat.color} font-medium`}
                    >
                      Shop now
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section data-ocid="featured.section" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Featured Products
              </h2>
              <p className="text-muted-foreground">
                Handpicked by our detailing experts
              </p>
            </div>
            <Link to="/shop" data-ocid="featured.view_all.link">
              <Button
                variant="ghost"
                className="gap-1 text-primary hover:text-primary/80"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {["sk1", "sk2", "sk3", "sk4"].map((sk) => (
                <div
                  key={sk}
                  className="rounded-lg overflow-hidden bg-card border border-border/50"
                >
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, i) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12" data-ocid="featured.empty_state">
              <p className="text-muted-foreground">
                Visit the{" "}
                <Link to="/shop" className="text-primary hover:underline">
                  shop
                </Link>{" "}
                to load our full product catalog.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-primary/10 border-y border-primary/20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Transform Your Vehicle?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Join thousands of car enthusiasts who trust Clear Coat Chemistry
              for their detailing needs.
            </p>
            <Link to="/shop">
              <Button
                size="lg"
                data-ocid="cta.shop.button"
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground electric-glow"
              >
                Browse All Products
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
