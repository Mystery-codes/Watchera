import { getAdminClient } from "@/lib/supabase/admin";

export interface AuditLogEntry {
  adminEmail: string;
  targetUserId: string;
  action: "suspend" | "unsuspend" | "delete" | "send_reset" | "revoke_sessions" | "export";
  reason?: string;
}

export async function logAdminAction(entry: AuditLogEntry): Promise<void> {
  try {
    const admin = getAdminClient();
    const { error } = await (admin.from("admin_audit_log") as any).insert([
      {
        action: entry.action,
        target_user_id: entry.targetUserId,
        moderator_email: entry.adminEmail,
        reason: entry.reason ?? null,
      },
    ]);

    if (error) {
      console.warn("[admin-audit] Failed to log action:", error.message);
    }
  } catch (err) {
    console.warn("[admin-audit] Error logging action:", err);
  }
}
