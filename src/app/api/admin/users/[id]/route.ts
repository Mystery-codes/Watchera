import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin-audit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminInfo = await requireAdmin();
  if (!adminInfo) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  try {
    const admin = getAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(id);

    if (error) {
      console.error("getUserById error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAdminAction({
      adminEmail: adminInfo.email,
      targetUserId: id,
      action: "export",
    });

    return NextResponse.json({ user: data.user });
  } catch (err) {
    console.error("Admin get user error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminInfo = await requireAdmin();
  if (!adminInfo) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  const body = await request.json();
  const { action, reason } = body;

  const validActions = [
    "suspend",
    "unsuspend",
    "delete",
    "send_reset",
    "revoke_sessions",
  ];

  if (!action || !validActions.includes(action)) {
    return NextResponse.json(
      { error: "Invalid action. Use 'suspend' | 'unsuspend' | 'delete' | 'send_reset' | 'revoke_sessions'" },
      { status: 400 }
    );
  }

  try {
    const admin = getAdminClient();

    if (action === "delete") {
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) {
        console.error("deleteUser error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      await logAdminAction({
        adminEmail: adminInfo.email,
        targetUserId: id,
        action: "delete",
        reason,
      });
      return NextResponse.json({ success: true, action: "deleted" });
    }

    if (action === "send_reset") {
      const { data: targetData } = await admin.auth.admin.getUserById(id);
      if (!targetData.user?.email) {
        return NextResponse.json({ error: "User has no email" }, { status: 400 });
      }

      const { data: linkData, error } = await admin.auth.admin.generateLink({
        type: "recovery",
        email: targetData.user.email,
        options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
      });

      if (error) {
        console.error("generateLink error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await logAdminAction({
        adminEmail: adminInfo.email,
        targetUserId: id,
        action: "send_reset",
        reason,
      });

      return NextResponse.json({
        success: true,
        action: "send_reset",
        actionLink: linkData?.properties?.action_link ?? null,
        email: targetData.user.email,
      });
    }

    if (action === "revoke_sessions") {
      const revokeRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}/sign_out`, {
        method: "POST",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!revokeRes.ok) {
        const errText = await revokeRes.text();
        console.error("revoke sessions error:", revokeRes.status, errText);
        return NextResponse.json(
          { error: `Failed to revoke sessions: ${revokeRes.status}` },
          { status: revokeRes.status }
        );
      }

      await logAdminAction({
        adminEmail: adminInfo.email,
        targetUserId: id,
        action: "revoke_sessions",
        reason,
      });

      return NextResponse.json({ success: true, action: "revoke_sessions" });
    }

    const banDuration = action === "suspend" ? "876000h" : "none";
    const { data: updatedData, error } = await admin.auth.admin.updateUserById(id, {
      ban_duration: banDuration,
    });

    if (error) {
      console.error("updateUserById error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const updatedUser = updatedData?.user;

    await logAdminAction({
      adminEmail: adminInfo.email,
      targetUserId: id,
      action,
      reason,
    });

    return NextResponse.json({
      success: true,
      action,
      user: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        bannedUntil: updatedUser?.banned_until ?? null,
      },
    });
  } catch (err) {
    console.error("Admin update user error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminInfo = await requireAdmin();
  if (!adminInfo) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  try {
    const admin = getAdminClient();
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      console.error("deleteUser error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAdminAction({
      adminEmail: adminInfo.email,
      targetUserId: id,
      action: "delete",
    });

    return NextResponse.json({ success: true, action: "deleted" });
  } catch (err) {
    console.error("Admin delete user error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
