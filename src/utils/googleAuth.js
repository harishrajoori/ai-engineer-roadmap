import { jwtDecode } from "jwt-decode";

/**
 * @param {string} credential Google ID token from GoogleLogin
 */
export function profileFromGoogleCredential(credential) {
  const decoded = jwtDecode(credential);
  return {
    sub: decoded.sub || "",
    name: decoded.name || decoded.email || "Google user",
    email: decoded.email || "",
    given_name: decoded.given_name || "",
    picture: decoded.picture || "",
    avatar: decoded.picture || "",
  };
}

/**
 * @param {Record<string, string>} apiKeys
 * @param {{ googleClientId?: string }} runtimeConfig from public/studio-config.json (optional)
 */
export function resolveGoogleClientId(apiKeys = {}, runtimeConfig = {}) {
  const fromSettings = (apiKeys.googleClientId || "").trim();
  const fromRuntime = (runtimeConfig.googleClientId || "").trim();
  const fromEnv = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
  return fromSettings || fromRuntime || fromEnv;
}
