create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  action text not null check (action in ('suspend', 'unsuspend', 'delete', 'send_reset', 'revoke_sessions', 'export')),
  target_user_id uuid references auth.users,
  moderator_email text,
  reason text,
  created_at timestamp with time zone default now()
);

alter table public.admin_audit_log enable row level security;

create policy "Service role full access"
  on public.admin_audit_log
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists admin_audit_log_target_user_id_idx
  on public.admin_audit_log (target_user_id);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);
