import { auth } from "../../../auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_id?: string }>; // Change to Promise
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const params = await searchParams; // Await searchParams
  
  if (!session) {
    return (
      <main className="p-10 text-center">
        <p>
          Please <Link href="/sign-in" className="underline">sign in</Link>.
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Subscription Successful!</CardTitle>
          <CardDescription>
            Thank you for subscribing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Your subscription has been activated. You now have access to premium features.
          </p>
          {params.checkout_id && (
            <p className="text-sm text-muted-foreground">
              Checkout ID: {params.checkout_id}
            </p>
          )}
          <div className="flex gap-4 mt-6">
            <Link href="/pricing" className="underline">
              View Plans
            </Link>
            <Link href="/" className="underline">
              Go to Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}