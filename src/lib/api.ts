// Dunne laag rond de API van het instituut. Faalt altijd netjes: geen verzonnen cijfers.

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, { ...init, headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers } });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body || body.ok === false) {
      return { ok: false, status: res.status, error: body?.error ?? "Het instituut is tijdelijk onbereikbaar." };
    }
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, status: 0, error: "Het instituut is tijdelijk onbereikbaar." };
  }
}

export type PublicIdea = { id: number; title: string; description: string; category: string; created_at: number };
export type AdminIdea = PublicIdea & { status: string; moderated_at: number | null };

export const api = {
  votes: () => request<{ counts: Record<string, number> }>("/api/votes"),
  vote: (itemId: string) => request<{ count: number; counted: boolean }>("/api/votes", { method: "POST", body: JSON.stringify({ itemId }) }),
  ideas: () => request<{ ideas: PublicIdea[] }>("/api/ideas"),
  submitIdea: (payload: Record<string, unknown>) => request<{ ticket: number; message: string }>("/api/ideas", { method: "POST", body: JSON.stringify(payload) }),
  adminList: (token: string, status: string) =>
    request<{ ideas: AdminIdea[] }>(`/api/admin/ideas?status=${encodeURIComponent(status)}`, { headers: { Authorization: `Bearer ${token}` } }),
  adminAction: (token: string, id: number, action: "approve" | "reject" | "delete") =>
    request<object>(`/api/admin/ideas/${id}`, { method: "POST", body: JSON.stringify({ action }), headers: { Authorization: `Bearer ${token}` } }),
};
