import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { profileFromGoogleCredential } from "../utils/googleAuth";

export default function GoogleSignInButton({ onSuccess, onAuthError, enabled, hint, width }) {
  if (!enabled) {
    return (
      <p className="text-xs text-slate-500 m-0" style={{ lineHeight: 1.4 }}>
        {hint || "Add a Google OAuth Web Client ID in Settings to enable sign-in."}
      </p>
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
