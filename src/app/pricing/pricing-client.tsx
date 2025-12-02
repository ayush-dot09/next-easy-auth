"use client";

import { authClient } from "../../../auth-client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function PricingClient({ 
  planSlug, 
  isUpgrade, 
  hasActiveSubscription 
}: { 
  planSlug: string; 
  isUpgrade: boolean;
  hasActiveSubscription: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      if (hasActiveSubscription) {
        // If user has active subscription, redirect to portal for plan changes
        await authClient.customer.portal();
      } else {
        // Only allow checkout for free users upgrading
        await authClient.checkout({
          slug: planSlug,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return "Loading...";
    return isUpgrade ? "Upgrade" : "Downgrade";
  };

  return (
    <Button onClick={handleAction} className="w-full" disabled={loading}>
      {getButtonText()}
    </Button>
  );
}