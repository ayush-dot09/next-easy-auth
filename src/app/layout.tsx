import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	title: "Better Auth",
	description: "Better auth demo",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="antialiased">
				<Navbar />
				<div className="min-h-screen pt-20 flex flex-col">{children}</div>
				<Toaster richColors/>
			</body>
		</html>
	);
}