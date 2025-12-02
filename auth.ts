import { betterAuth, BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { sendEmail } from "./actions/email";
import { openAPI } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import { Polar } from "@polar-sh/sdk";
import { polar, checkout,portal,webhooks } from "@polar-sh/better-auth";

const polarClient = new Polar({ 
  accessToken: process.env.POLAR_ACCESS_TOKEN, 
  server: 'sandbox'
}); 

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 1
    }
  },
  user: {
    additionalFields: {
      subscriptionPlan: {
        type: "string",
        required: false,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ newEmail, url }) => {
        await sendEmail({
          to: newEmail,
          subject: 'Verify your email change',
          text: `Click the link to verify: ${url}`
        })
      }
    }
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [ polar({ 
    client: polarClient, 
    createCustomerOnSignUp: true, 
    use: [ 
        checkout({ 
          products:[
            {
              productId: process.env.POLAR_PRODUCT_ID_PREMIUM!,
              slug: "premium"
          },
          {
            productId: process.env.POLAR_PRODUCT_ID_GOLD!,
            slug:"gold"
          }
        ],
            successUrl: "/success?checkout_id={CHECKOUT_ID}", 
            authenticatedUsersOnly: true
        }), 
        portal(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          
          onPayload: async (payload) => {
            // Catch-all webhook handler
          },

          onCustomerStateChanged: async (payload) => {
            const customer = payload.data as any;
            const customerExternalId = customer.externalId || customer.external_id;
            
            if (!customerExternalId) {
              return;
            }

            const subscriptions = customer.subscriptions || [];
            
            // Filter to only active subscriptions
            // Even if cancel_at_period_end is true, subscription is still active until revoked
            const activeSubscriptions = subscriptions.filter((sub: any) => 
              (sub.status === "active" || sub.status === "trialing")
            );
            
            let plan = "free";
            
            for (const sub of activeSubscriptions) {
              const productId = sub.product_id || sub.productId;
              
              if (productId === process.env.POLAR_PRODUCT_ID_GOLD) {
                plan = "gold";
                break;
              } else if (productId === process.env.POLAR_PRODUCT_ID_PREMIUM && plan !== "gold") {
                plan = "premium";
              }
            }

            try {
              await prisma.user.update({
                where: { id: customerExternalId },
                data: {
                  subscriptionPlan: plan,
                },
              });
            } catch (error) {
            }
          },

          onSubscriptionActive: async(payload) =>{
            const subscription = payload.data;
            const customerExternalId = subscription.customer?.externalId;

            if(!customerExternalId) {
              return;
            }

            const productId = subscription.productId;
            let plan = "free";

            if (productId === process.env.POLAR_PRODUCT_ID_PREMIUM) {
              plan = "premium";
            } else if (productId === process.env.POLAR_PRODUCT_ID_GOLD) {
              plan = "gold";
            }

            try {
              await prisma.user.update({
                where: { id: customerExternalId },
                data: {
                  subscriptionPlan: plan,
                },
              });
            } catch (error) {
              // Handle error silently or log to error tracking service
            }
          },

          onSubscriptionUpdated: async (payload) => {
            const subscription = payload.data;
            const customerExternalId = subscription.customer?.externalId;
            
            if (!customerExternalId) {
              return;
            }

            const productId = subscription.productId;
            let plan = "free";

            if (productId === process.env.POLAR_PRODUCT_ID_PREMIUM) {
              plan = "premium";
            } else if (productId === process.env.POLAR_PRODUCT_ID_GOLD) {
              plan = "gold";
            }

            try {
              await prisma.user.update({
                where: { id: customerExternalId },
                data: {
                  subscriptionPlan: plan,
                },
              });
            } catch (error) {
              // Handle error silently or log to error tracking service
            }
          },

          onSubscriptionRevoked: async (payload) => {
            const subscription = payload.data;
            const customerExternalId = subscription.customer?.externalId;
            
            if (!customerExternalId) return;

            await prisma.user.update({
              where: { id: customerExternalId },
              data: {
                subscriptionPlan: "free",
              },
            });
          },

        })
    ], 
}),
    openAPI(),
    admin({
      impersonationSessionDuration: 60 * 60 * 24 * 7,
    })
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${verificationUrl}`,
      });
    },
  }
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;