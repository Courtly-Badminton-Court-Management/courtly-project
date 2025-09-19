// Replace the whole file with this richer helper.
export async function postJSON(url: string, body: unknown): Promise<any> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") || "";
  let payload: any = null;

  // Try to parse JSON; if not JSON, read as text (e.g., Django HTML error page)
  try {
    if (contentType.includes("application/json")) {
      payload = await res.json();
    } else {
      const text = await res.text();
      payload = text?.slice(0, 1000); // avoid dumping megabytes
    }
  } catch {
    payload = null;
  }

  if (!res.ok) {
    // Build a helpful error object for the UI
    const err: Record<string, any> = {
      status: res.status,
      statusText: res.statusText,
    };
    if (payload && typeof payload === "object") {
      Object.assign(err, payload); // DRF shape: {field: [...], non_field_errors: [...]}
    } else if (typeof payload === "string") {
      err.detail = payload;
    } else {
      err.detail = "Request failed with no response body";
    }
    throw err;
  }

  // For 201 with empty body, just return {}
  return payload && typeof payload === "object" ? payload : {};
}
