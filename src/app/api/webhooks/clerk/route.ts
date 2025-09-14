import { deleteUser, upsertUser } from "@/features/users/db";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const event = await verifyWebhook(req);

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const clerkData: any = event.data; 
        const primaryEmail = clerkData.email_addresses?.find(
          (e: any) => e.id === clerkData.primary_email_address_id
        )?.email_address;
        if (!primaryEmail) {
          return new Response("Primary email missing", { status: 400 });
        }
        await upsertUser({
          id: clerkData.id,
          name: `${clerkData.first_name ?? ""} ${
            clerkData.last_name ?? ""
          }`.trim(),
          email: primaryEmail,
          imageUrl: clerkData.image_url,
          createdAt: new Date(clerkData.created_at),
          updatedAt: new Date(clerkData.updated_at ?? Date.now()),
        });
        break;
      }
      case "user.deleted": {
        const id = (event.data as any)?.id;
        if (!id) return new Response("User id missing", { status: 400 });
        await deleteUser(id);
        break;
      }
      default:
        break;
    }

    return new Response("ok", { status: 200 });
  } catch (err: any) {
    console.error("Clerk webhook error", err);
    return new Response("invalid", { status: 400 });
  }
}
