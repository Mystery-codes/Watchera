export const ADMIN_EMAIL = "ifediorahchinonso5@gmail.com";

export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
