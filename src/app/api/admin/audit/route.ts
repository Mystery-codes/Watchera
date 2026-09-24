import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const adminInfo = await requireAdmin();
  if (!adminInfo) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const userId = request.nextUrl.searchParams.get("userId");
  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? "50")));

  try {
    const admin = getAdminClient();
    let query = admin.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(limit);

    if (userId) {
      query = query.eq("target_user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("listAuditLogs error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: data ?? [] });
  } catch (err) {
    console.error("Admin list audit logs error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
