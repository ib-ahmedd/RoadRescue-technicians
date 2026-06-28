export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type ApiFetchInit = RequestInit & { bustCache?: boolean };

export function apiFetch(path: string, init: ApiFetchInit = {}): Promise<Response> {
  const { bustCache = false, headers, ...rest } = init;
  let url = `${API_BASE_URL}${path}`;

  if (bustCache) {
    url += `${url.includes("?") ? "&" : "?"}_=${Date.now()}`;
  }

  return fetch(url, {
    ...rest,
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      ...headers,
    },
  });
}

export async function parseApiResponse<T = unknown>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Could not reach the API server. Make sure it is running on port 5000. (HTTP ${response.status})`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
        ? data.error
        : "Request failed. Please try again.";
    throw new Error(message);
  }

  return data as T;
}
