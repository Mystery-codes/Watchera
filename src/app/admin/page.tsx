"use client";

import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  RefreshCw,
  Ban,
  ShieldCheck,
  Trash2,
  Clock,
  KeyRound,
  LogOut,
  Download,
  History,
  X,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  emailConfirmedAt: string | null;
  bannedUntil: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  userMetadata: Record<string, unknown>;
}

interface UsersResponse {
  users: AdminUser[];
  page: number;
  perPage: number;
  total: number;
}

const PER_PAGE = 50;

function formatDate(input: string | null) {
  if (!input) return "—";
  return new Date(input).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ user }: { user: AdminUser }) {
  if (user.bannedUntil) {
    return (
      <Badge variant="destructive" className="gap-1">
        <Ban className="size-3" /> Suspended
      </Badge>
    );
  }
  if (!user.emailConfirmedAt) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="size-3" /> Unconfirmed
      </Badge>
    );
  }
  return (
    <Badge
      variant="default"
      className="gap-1 bg-green-700/20 text-green-400 hover:bg-green-700/30"
    >
      <ShieldCheck className="size-3" /> Active
    </Badge>
  );
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<"suspend" | "unsuspend" | "delete" | null>(
    null
  );
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<Array<Record<string, unknown>> | null>(null);
  const [sessions, setSessions] = useState<Array<Record<string, unknown>> | null>(null);
  const [auditLoading, setAuditLoading] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const perPage = PER_PAGE;
  const totalPages = Math.ceil(total / perPage);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(PER_PAGE),
      });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to load users");
        return;
      }
      const data: UsersResponse = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function confirmActionFor(user: AdminUser, action: "suspend" | "unsuspend" | "delete") {
    setConfirmUser(user);
    setConfirmAction(action);
  }

  async function sendReset(user: AdminUser) {
    setResetLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_reset" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send reset link");
      } else {
        setResetLink(data.actionLink ?? null);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setResetLoading(null);
    }
  }

  async function revokeSessions(user: AdminUser) {
    setActionLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_sessions" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to revoke sessions");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  async function exportUser(user: AdminUser) {
    setExportLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to export user");
        return;
      }
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data.user, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${user.email ?? user.id}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setExportLoading(null);
    }
  }

  async function viewAuditLogs(user: AdminUser) {
    setAuditLoading(user.id);
    try {
      const res = await fetch(`/api/admin/audit?userId=${encodeURIComponent(user.id)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load audit logs");
        return;
      }
      setAuditLogs(data.logs ?? []);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setAuditLoading(null);
    }
  }

  async function viewSessions(user: AdminUser) {
    setAuditLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}/sessions`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load sessions");
        return;
      }
      setSessions(data.sessions ?? []);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setAuditLoading(null);
    }
  }

  async function executeAction() {
    if (!confirmUser || !confirmAction) return;

    setActionLoading(confirmUser.id);
    try {
      let res: Response;
      if (confirmAction === "delete") {
        res = await fetch(`/api/admin/users/${confirmUser.id}`, {
          method: "DELETE",
        });
      } else {
        res = await fetch(`/api/admin/users/${confirmUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: confirmAction }),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Action failed");
      } else {
        if (confirmAction === "delete") {
          setUsers((prev) => prev.filter((u) => u.id !== confirmUser.id));
          setTotal((prev) => prev - 1);
        } else {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === confirmUser.id
                ? { ...u, bannedUntil: confirmAction === "suspend" ? new Date().toISOString() : null }
                : u
            )
          );
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setActionLoading(null);
      setConfirmUser(null);
      setConfirmAction(null);
    }
  }

  function getActionLabel(user: AdminUser) {
    if (user.bannedUntil) return "Unsuspend";
    return "Suspend";
  }

  function getActionVariant(user: AdminUser) {
    if (user.bannedUntil) return "secondary";
    return "outline";
  }

  return (
    <main className="min-h-full bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Moderate users — {total} total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 w-48"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchUsers}
              disabled={loading}
              aria-label="Refresh"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {resetLink && (
          <div className="mb-4 rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary-foreground">
            <p className="font-semibold">Password reset link generated</p>
            <p className="mt-1 text-muted-foreground">
              Share this link with the user. It expires after use.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="block max-w-full truncate rounded bg-black/40 px-2 py-1 text-xs text-white">
                {resetLink}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(resetLink)}
              >
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResetLink(null)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-full text-left text-sm">
            <thead className="bg-secondary/30">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-300">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Email</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Confirmed</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Created</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Last Sign In</th>
                <th className="px-4 py-3 font-medium text-right text-zinc-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-border transition-colors hover:bg-secondary/10"
                  >
                    <td className="px-4 py-3">
                      <StatusBadge user={user} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="block max-w-[240px] truncate font-mono text-xs text-white">
                        {user.email ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(user.emailConfirmedAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(user.lastSignInAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          variant={getActionVariant(user)}
                          size="sm"
                          onClick={() =>
                            confirmActionFor(user, user.bannedUntil ? "unsuspend" : "suspend")
                          }
                          disabled={!!actionLoading}
                        >
                          {getActionLabel(user)}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeSessions(user)}
                          disabled={!!actionLoading}
                          title="Revoke all sessions"
                        >
                          <LogOut className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => sendReset(user)}
                          disabled={!!resetLoading}
                          title="Send password reset link"
                        >
                          <KeyRound className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportUser(user)}
                          disabled={!!exportLoading}
                          title="Export user data"
                        >
                          <Download className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewSessions(user)}
                          disabled={!!auditLoading}
                          title="View active sessions"
                        >
                          <LogOut className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewAuditLogs(user)}
                          disabled={!!auditLoading}
                          title="View audit logs"
                        >
                          <History className="size-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmActionFor(user, "delete")}
                          disabled={!!actionLoading}
                          title="Delete user"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={sessions !== null}
        onOpenChange={(open) => {
          if (!open) setSessions(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Active Sessions</DialogTitle>
            <DialogDescription>
              Current sign-in sessions for this user.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border">
            {sessions && sessions.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No active sessions found.
              </p>
            ) : (
              sessions && (
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-secondary/30">
                    <tr>
                      <th className="px-4 py-2 font-medium text-zinc-300">Created</th>
                      <th className="px-4 py-2 font-medium text-zinc-300">Expires</th>
                      <th className="px-4 py-2 font-medium text-zinc-300">Last Refreshed</th>
                      <th className="px-4 py-2 font-medium text-zinc-300">IP</th>
                      <th className="px-4 py-2 font-medium text-zinc-300">Device</th>
                      <th className="px-4 py-2 font-medium text-zinc-300">Auth Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={String(session.id)} className="border-t border-border">
                        <td className="px-4 py-2 text-muted-foreground">
                          {formatDate(session.created_at as string | null)}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {formatDate(session.not_after as string | null)}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {formatDate(session.refreshed_at as string | null)}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {String(session.ip ?? "—")}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {String(session.user_agent ?? "—")}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {String(session.aal ?? "—")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSessions(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={auditLogs !== null}
        onOpenChange={(open) => {
          if (!open) setAuditLogs(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Admin Audit Log</DialogTitle>
            <DialogDescription>
              Recent moderation actions for this user.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border">
            {auditLogs && auditLogs.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No audit log entries found.
              </p>
            ) : (
              auditLogs && (
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-secondary/30">
                    <tr>
                      <th className="px-4 py-2 font-medium text-zinc-300">Action</th>
                      <th className="px-4 py-2 font-medium text-zinc-300">Moderator</th>
                      <th className="px-4 py-2 font-medium text-zinc-300">Reason</th>
                      <th className="px-4 py-2 font-medium text-zinc-300">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={String(log.id)} className="border-t border-border">
                        <td className="px-4 py-2">{String(log.action)}</td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {String(log.moderator_email ?? "—")}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {String(log.reason ?? "—")}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {formatDate(log.created_at as string | null)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAuditLogs(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmUser}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmUser(null);
            setConfirmAction(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "delete"
                ? "Delete user?"
                : confirmAction === "suspend"
                  ? "Suspend user?"
                  : "Unsuspend user?"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "delete"
                ? `This will permanently delete ${confirmUser?.email}. This action cannot be undone.`
                : confirmAction === "suspend"
                  ? `Suspend ${confirmUser?.email}? They won't be able to sign in.`
                  : `Unsuspend ${confirmUser?.email}? They will be able to sign in again.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmUser(null);
                setConfirmAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction === "delete" ? "destructive" : "default"}
              onClick={executeAction}
              disabled={!!actionLoading}
            >
              {confirmAction === "delete"
                ? "Delete"
                : confirmAction === "suspend"
                  ? "Suspend"
                  : "Unsuspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
}
