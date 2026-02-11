const DEFAULT_API_BASE = "http://127.0.0.1:3001";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? DEFAULT_API_BASE;

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export type ApiCourse = {
  id: string;
  title: string;
  description: string;
  priceYd: string;
  authorAddress: string;
  status?: string;
  owned?: boolean;
  content?: string;
};

export type AuthUser = {
  address: string;
  role: "STUDENT" | "AUTHOR" | "ADMIN";
  status: "ACTIVE" | "FROZEN";
};

export async function fetchCourses(): Promise<ApiCourse[]> {
  return fetchJson<ApiCourse[]>("/courses");
}

export async function fetchCourse(id: string): Promise<ApiCourse> {
  return fetchJson<ApiCourse>(`/courses/${id}`);
}

export async function fetchCourseContent(id: string, address: string): Promise<string> {
  const res = await fetchJson<{ content: string }>(`/courses/${id}/content?address=${address}`);
  return res.content;
}

export async function createCourse(input: {
  title: string;
  description: string;
  content: string;
  priceYd: string;
  authorAddress: string;
}): Promise<{ id: string; txIntent: string }> {
  return fetchJson<{ id: string; txIntent: string }>("/courses", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function updateCourse(
  id: string,
  input: {
    title?: string;
    description?: string;
    content?: string;
    priceYd?: string;
  },
  token: string
): Promise<ApiCourse> {
  return fetchJson<ApiCourse>(`/courses/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(input)
  });
}

export async function unpublishCourse(id: string, token: string): Promise<{ ok: boolean }> {
  return fetchJson(`/courses/${id}/unpublish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function requestPublishCourse(
  id: string,
  token: string
): Promise<{ ok: boolean }> {
  return fetchJson(`/courses/${id}/request-publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function recordPurchase(input: {
  txHash: string;
  courseId: string;
  buyer: string;
  token?: string;
}): Promise<{ ok: boolean }> {
  return fetchJson<{ ok: boolean }>("/hooks/purchase", {
    method: "POST",
    headers: input.token
      ? {
          Authorization: `Bearer ${input.token}`
        }
      : undefined,
    body: JSON.stringify(input)
  });
}

export async function requestAuthChallenge(address: string): Promise<{
  message: string;
  nonce: string;
  expiresAt: number;
}> {
  return fetchJson("/auth/challenge", {
    method: "POST",
    body: JSON.stringify({ address })
  });
}

export async function verifyAuthSignature(input: {
  address: string;
  message: string;
  signature: string;
  nonce: string;
}): Promise<{
  token: string;
  expiresAt: number;
  user: AuthUser;
}> {
  return fetchJson("/auth/verify", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function fetchMe(token: string): Promise<AuthUser> {
  return fetchJson("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function adminApproveCourse(id: string, token: string): Promise<{ ok: boolean }> {
  return fetchJson(`/admin/courses/${id}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function adminUnpublishCourse(id: string, token: string): Promise<{ ok: boolean }> {
  return fetchJson(`/admin/courses/${id}/unpublish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function adminFreezeUser(address: string, token: string): Promise<{ ok: boolean }> {
  return fetchJson(`/admin/users/${address}/freeze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
