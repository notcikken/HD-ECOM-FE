import type { FetchOptions } from "ofetch";

const buildApiUrl = (path: string) => {
  const config = useRuntimeConfig();
  const base = (config.public?.apiBase || "").replace(/\/+$/, "");
  if (!path) return base || "/";
  // If path is absolute URL, return as-is
  if (/^https?:\/\//.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalizedPath}` : normalizedPath;
};

const apiFetch = async <T = any>(path: string, opts: FetchOptions) => {
  const url = buildApiUrl(path);
  return await $fetch<T>(url, opts as any);
};

const apiGet = <T = any>(path: string, opts?: FetchOptions) =>
  apiFetch<T>(path, { method: "GET", ...opts });

const apiPost = <T = any>(path: string, body?: any, opts?: FetchOptions) =>
  apiFetch<T>(path, { method: "POST", body, ...opts });

const apiPatch = <T = any>(path: string, body?: any, opts?: FetchOptions) =>
  apiFetch<T>(path, { method: "PATCH", body, ...opts });

const apiDelete = <T = any>(path: string, opts?: FetchOptions) =>
  apiFetch<T>(path, { method: "DELETE", ...opts });

export { buildApiUrl, apiFetch, apiGet, apiPost, apiPatch, apiDelete };
