import { currentUser } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (userResult.length > 0) {
    return NextResponse.json({ user: userResult[0], created: false });
  }

  const result = await db
    .insert(users)
    .values({
      name: user.fullName ?? "",
      email,
    })
    .returning();

  return NextResponse.json({ user: result[0], created: true });
}