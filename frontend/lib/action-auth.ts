import { readAuthSession } from "./auth-session";

export type ActionRole = "STUDENT" | "AUTHOR" | "ADMIN";

export function getActionAuth(address?: string, requiredRoles?: ActionRole[]) {
  const session = readAuthSession();
  if (!session) {
    return {
      ok: false,
      reason: "Please login first."
    };
  }

  if (session.user.status !== "ACTIVE") {
    return {
      ok: false,
      reason: "Account is not active."
    };
  }

  if (!address) {
    return {
      ok: false,
      reason: "Connect wallet first."
    };
  }

  if (session.user.address.toLowerCase() !== address.toLowerCase()) {
    return {
      ok: false,
      reason: "Login wallet and connected wallet do not match."
    };
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const allowed = requiredRoles.includes(session.user.role as ActionRole) || session.user.role === "ADMIN";
    if (!allowed) {
      return {
        ok: false,
        reason: "Insufficient role."
      };
    }
  }

  return {
    ok: true,
    token: session.token,
    role: session.user.role
  };
}

