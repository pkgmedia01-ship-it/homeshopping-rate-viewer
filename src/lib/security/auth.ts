export function emailBelongsToWorkspace(email: string, domain: string): boolean {
  const parts = email.toLowerCase().split('@');
  return parts.length === 2 && parts[0]!.length > 0 && parts[1] === domain.toLowerCase();
}
export function validateGoogleClaims(claims: { email?: unknown; email_verified?: unknown; hd?: unknown }, domain: string): boolean {
  return claims.email_verified === true && typeof claims.email === 'string' && typeof claims.hd === 'string' && claims.hd.toLowerCase() === domain.toLowerCase() && emailBelongsToWorkspace(claims.email, domain);
}
