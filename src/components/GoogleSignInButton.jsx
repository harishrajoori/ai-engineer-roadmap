import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { profileFromGoogleCredential } from "../utils/googleAuth";

export default function GoogleSignInButton({
  onSuccess,
  onAuthError,
  enabled,
  hint,
  width,
  onConfigureOAuth,
}) {
  if (!enabled) {
    return (
      <div className="google-signin-unconfigured">
        {onConfigureOAuth ? (
          <button type="button" className="google-signin-setup-btn" onClick={onConfigureOAuth}>
            Set up Google sign-in
          </button>
        ) : null}
        <p className="google-signin-setup-hint">
          {hint ||
            "Add your OAuth Web Client ID in Settings (Apply), or set VITE_GOOGLE_CLIENT_ID on deploy."}
        </p>
      </div>
    );
  }

  return (
    <GoogleLogin
      onSuccess={(response) => {
        if (response?.credential) {
          onSuccess(profileFromGoogleCredential(response.credential), response.credential);
        }
      }}
      onError={() => {
        onAuthError?.(
          "Google sign-in failed. Confirm the OAuth Web Client ID, click Save Settings if you pasted it locally, and add this site URL under Authorized JavaScript origins in Google Cloud Console."
        );
      }}
      theme="filled_black"
      size="large"
      text="signin_with"
      shape="rectangular"
      width={width || undefined}
    />
  );
}
