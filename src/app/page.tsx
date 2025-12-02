import { auth } from "../../auth";
import { headers } from "next/headers";
import Link from "next/link";
import StopImpersonateButton from "@/components/admin/stop-impersonation-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PortalButton } from "./pricing/portal-button";


export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const user = session?.user as any;
	const plan = user.subscriptionPlan ;;
	const isPaidPlan = plan === "premium" || plan === "gold";

	return (
		<main className="container mx-auto p-8 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-4xl font-bold">Dashboard</h1>
					<p className="text-muted-foreground mt-2">
						Welcome back, {session?.user?.email}
					</p>
				</div>
				{session?.session?.impersonatedBy && <StopImpersonateButton />}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Subscription Plan</CardTitle>
					<CardDescription>
						Your current subscription status
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<p className="text-sm text-muted-foreground">Current Plan</p>
						<p className="text-2xl font-semibold capitalize">{plan}</p>
					</div>
					
					{isPaidPlan ? (
						<div className="flex gap-4 pt-4">
							<Link href="/pricing">
								<Button variant="outline">Change Plan</Button>
							</Link>
							<PortalButton variant="outline">Manage Billing</PortalButton>
						</div>
					) : (
						<div className="pt-4">
							<Link href="/pricing">
								<Button>Upgrade to Premium</Button>
							</Link>
						</div>
					)}
				</CardContent>
			</Card>
		</main>
	);
}