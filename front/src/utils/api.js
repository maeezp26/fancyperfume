const rawApiBase = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

const isLocalDev =
  import.meta.env.DEV &&
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const API_BASE = isLocalDev ? "" : rawApiBase;

const hasAbsoluteScheme = (value) =>
  /^(?:https?:)?\/\//i.test(value) || value.startsWith("blob:") || value.startsWith("data:");

export const apiUrl = (path = "") => {
  if (!path) return API_BASE || "";
  if (hasAbsoluteScheme(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath;
};

export const assetUrl = (path = "") => {
  if (!path) return "";
  if (hasAbsoluteScheme(path)) return path;
  return apiUrl(path);
};
