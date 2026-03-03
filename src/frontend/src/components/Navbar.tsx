import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { LogIn, LogOut, Menu, Shield, ShoppingCart, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCart } from "../hooks/useQueries";
import { useIsAdmin } from "../hooks/useQueries";

export function Navbar() {
  const location = useLocation();
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: cartItems } = useCart();
  const { data: isAdmin } = useIsAdmin();

  const cartCount = cartItems?.length ?? 0;
  const isLoggedIn = !!identity;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    ...(isLoggedIn ? [{ to: "/orders", label: "My Orders" }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" data-ocid="nav.link">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              src="/assets/generated/logo-transparent.dim_200x60.png"
              alt="Clear Coat Chemistry"
              className="h-9 w-auto"
            />
          </motion.div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid="nav.link"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.to
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Cart */}
          <Link to="/cart" data-ocid="nav.cart.link">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:text-primary"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                      {cartCount > 9 ? "9+" : cartCount}
                    </Badge>
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </Link>

          {/* Auth */}
          {isLoggedIn ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              data-ocid="nav.logout.button"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="nav.login.button"
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground electric-glow"
            >
              <LogIn className="h-4 w-4" />
              {isLoggingIn ? "Signing In…" : "Sign In"}
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <Link to="/cart" data-ocid="nav.cart.mobile.link">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:text-primary"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                  {cartCount > 9 ? "9+" : cartCount}
                </Badge>
              )}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            data-ocid="nav.mobile.toggle"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border/50"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  data-ocid="nav.mobile.link"
                  className={`text-sm font-medium py-2 transition-colors hover:text-primary ${
                    location.pathname === link.to
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label === "Admin" && (
                    <Shield className="inline h-4 w-4 mr-1" />
                  )}
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border/50">
                {isLoggedIn ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clear();
                      setMobileOpen(false);
                    }}
                    data-ocid="nav.mobile.logout.button"
                    className="gap-2 w-full justify-start text-muted-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      login();
                      setMobileOpen(false);
                    }}
                    disabled={isLoggingIn}
                    data-ocid="nav.mobile.login.button"
                    className="gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <LogIn className="h-4 w-4" />
                    {isLoggingIn ? "Signing In…" : "Sign In"}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
