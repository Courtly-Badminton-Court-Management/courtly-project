// fetch-auttaja, joka lisää Authorization-headerin ja yrittää token refreshin 401:ssä
export async function authFetch(path: string, init: RequestInit = {}) {
  const base = process.env.NEXT_PUBLIC_API_BASE!;
  const access = localStorage.getItem("access");

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
    },
  });

  if (res.status !== 401) return res;

  const refresh = localStorage.getItem("refresh");
  if (!refresh) return res;

  const r = await fetch(`${base}/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!r.ok) return res;
  const { access: newAccess } = await r.json();
  localStorage.setItem("access", newAccess);

  return fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      Authorization: `Bearer ${newAccess}`,
    },
  });
}
