"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "../../../auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function StopImpersonateButton() {
  const router = useRouter();

  const handleStopImpersonating = async () => {
    try {
      await authClient.admin.stopImpersonating();
      router.push("/admin");
      toast.info("Stopped Impersonation", {
        description: "You are now back to your admin account"
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to stop impersonation:", error);
    }
  };

  return (
    <Button onClick={handleStopImpersonating} variant="destructive" size="sm">
      Stop Impersonating
    </Button>
  );
}