import { auth } from "../../../auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PricingClient } from "./pricing-client";
import { PortalButton } from "./portal-button";


export default async function SubscriptionPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    return (
      <main className="p-10 text-center">
        <p>
          Please <Link href="/sign-in" className="underline">sign in</Link> to view subscription plans.
        </p>
      </main>
    );
  }

  const currentPlan = (session.user as any).subscriptionPlan || "free";
  const hasActiveSubscription = currentPlan === "premium" || currentPlan === "gold";

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Basic features",
        "Limited access",
        "Community support",
      ],
      slug: null,
      productId: null,
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "per month",
      features: [
        "All Free features",
        "Premium features",
        "Priority support",
        "Advanced analytics",
      ],
      slug: "premium",
      productId: process.env.POLAR_PRODUCT_ID_PREMIUM!,
    },
    {
      name: "Gold",
      price: "$19.99",
      period: "per month",
      features: [
        "All Premium features",
        "Gold-exclusive features",
        "24/7 priority support",
        "Advanced analytics",
        "API access",
      ],
      slug: "gold",
      productId: process.env.POLAR_PRODUCT_ID_GOLD!,
    },
  ];

  return (
    <main className="container mx-auto p-10">
      <h1 className="text-4xl font-bold text-center mb-8">Choose Your Plan</h1>
      <p className="text-center text-muted-foreground mb-12">
        Current plan: <span className="font-semibold capitalize">{currentPlan}</span>
      </p>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = plan.name.toLowerCase() === currentPlan;
          const isUpgrade = 
            (currentPlan === "free" && plan.slug !== null) ||
            (currentPlan === "premium" && plan.slug === "gold");

          return (
            <Card 
              key={plan.name} 
              className={isCurrentPlan ? "border-primary border-2" : ""}
            >
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-sm">/{plan.period}</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrentPlan ? (
                  <button disabled className="w-full px-4 py-2 bg-gray-200 text-gray-500 rounded-md cursor-not-allowed">
                    Current Plan
                  </button>
                ) : plan.slug ? (
                  <PricingClient 
                    planSlug={plan.slug} 
                    isUpgrade={isUpgrade} 
                    hasActiveSubscription={hasActiveSubscription}
                  />
                ) : (
                  <button disabled className="w-full px-4 py-2 bg-gray-200 text-gray-500 rounded-md cursor-not-allowed">
                    Free Plan
                  </button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center">
      <PortalButton variant="ghost">
          Manage billing & subscriptions
        </PortalButton>
      </div>
    </main>
  );
}