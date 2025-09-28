export type Tokens = { access: string | null; refresh: string | null };

let mem: Tokens = { access: null, refresh: null };
const KEY = "courtly.tokens";
const chan =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel("courtly-auth")
    : null;

function readSession(): Tokens {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Tokens) : { access: null, refresh: null };
  } catch {
    return { access: null, refresh: null };
  }
}
function writeSession(t: Tokens | null) {
  try {
    if (!t || (!t.access && !t.refresh)) sessionStorage.removeItem(KEY);
    else sessionStorage.setItem(KEY, JSON.stringify(t));
  } catch {}
}

export function initTokensFromSession() {
  if (typeof window !== "undefined") mem = readSession();
}

export function getAccess() { return mem.access; }
export function getRefresh() { return mem.refresh; }

export function setTokens(next: Tokens, persist = true) {
  mem = next;
  if (persist) writeSession(next);
  chan?.postMessage({ type: "SET", payload: next });
}

export function clearTokens() {
  mem = { access: null, refresh: null };
  writeSession(null);
  chan?.postMessage({ type: "CLEAR" });
}

// sync token state ข้ามแท็บ/หน้าต่าง
chan?.addEventListener("message", (e: any) => {
  if (e?.data?.type === "SET") mem = e.data.payload;
  if (e?.data?.type === "CLEAR") mem = { access: null, refresh: null };
});
