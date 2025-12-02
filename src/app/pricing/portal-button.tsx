"use client";

import { authClient } from "../../../auth-client";
import { Button } from "@/components/ui/button";

export function PortalButton({ children, variant = "outline" }: { children: React.ReactNode; variant?: "default" | "outline" | "ghost" }) {
  const handlePortal = async () => {
    try {
      await authClient.customer.portal();
    } catch (error) {
      console.error("Portal error:", error);
    }
  };

  return (
    <Button onClick={handlePortal} variant={variant}>
      {children}
    </Button>
  );
}