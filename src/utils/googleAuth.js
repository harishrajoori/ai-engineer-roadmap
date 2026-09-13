import { jwtDecode } from "jwt-decode";

/**
 * @param {string} credential Google ID token from GoogleLogin
 */
export function profileFromGoogleCredential(credential) {
  const decoded = jwtDecode(credential);
  return {
    sub: decoded.sub || "",
    name: decoded.name || "",
    email: decoded.email || "",
    given_name: decoded.given_name || "",
    picture: decoded.picture || "",
    avatar: decoded.picture || "",
  };
}

export function resolveGoogleClientId(apiKeys = {}) {
  const fromSettings = (apiKeys.googleClientId || "").trim();
  const fromEnv = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
  return fromSettings || fromEnv;
}
