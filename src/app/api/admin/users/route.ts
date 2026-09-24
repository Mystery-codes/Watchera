import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? "1"));
  const perPage = Math.min(
    100,
    Math.max(1, Number(request.nextUrl.searchParams.get("perPage") ?? "50"))
  );
  const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";

  try {
    const admin = getAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      console.error("listUsers error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const users = data.users
      .filter((u) => (search ? (u.email ?? "").toLowerCase().includes(search) : true))
      .map((u) => ({
        id: u.id,
        email: u.email,
        emailConfirmedAt: u.email_confirmed_at ?? null,
        bannedUntil: u.banned_until ?? null,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        userMetadata: u.user_metadata,
      }));

    return NextResponse.json({
      users,
      page,
      perPage,
      total: data.total,
    });
  } catch (err) {
    console.error("Admin list users error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
