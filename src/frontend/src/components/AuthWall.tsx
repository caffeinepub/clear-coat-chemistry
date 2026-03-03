import { Button } from "@/components/ui/button";
import { Lock, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthWallProps {
  message?: string;
}

export function AuthWall({
  message = "Please sign in to continue",
}: AuthWallProps) {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-sm mx-auto p-8 rounded-xl bg-card border border-border/50"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2 font-display">
          Authentication Required
        </h2>
        <p className="text-muted-foreground text-sm mb-6">{message}</p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          data-ocid="auth.login.button"
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground electric-glow"
        >
          <LogIn className="h-4 w-4" />
          {isLoggingIn ? "Signing In…" : "Sign In"}
        </Button>
      </motion.div>
    </div>
  );
}
