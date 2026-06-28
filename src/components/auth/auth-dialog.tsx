"use client";

import * as React from "react";
import { Loader2, LogIn, UserPlus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { type AuthMode } from "@/lib/auth-config";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: AuthMode;
  onSuccess?: () => void;
}

export function AuthDialog({
  open,
  onOpenChange,
  mode = "login",
  onSuccess,
}: AuthDialogProps) {
  const { signIn } = useAuth();
  const [formMode, setFormMode] = React.useState<AuthMode>(mode);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const resetForm = React.useCallback(() => {
    setFormMode(mode);
    setError(null);
    setEmail("");
    setPassword("");
  }, [mode]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setLoading(false);
      setError(null);
    } else {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signIn(email, password, formMode);
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent key={`${open}-${mode}`} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {formMode === "login" ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
            {formMode === "login" ? "Welcome back" : "Create your account"}
          </DialogTitle>
          <DialogDescription>
            {formMode === "login"
              ? "Log in to continue checkout or manage the admin area."
              : "Sign up for a customer account and continue shopping securely."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {formMode === "login" ? "Sign in" : "Create account"}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-primary underline-offset-4 hover:underline"
              onClick={() => setFormMode(formMode === "login" ? "signup" : "login")}
            >
              {formMode === "login" ? "Create an account" : "Already have an account?"}
            </button>
            <span className="text-muted-foreground">Use your account to manage orders and profile.</span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
