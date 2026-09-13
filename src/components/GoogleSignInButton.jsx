import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { profileFromGoogleCredential } from "../utils/googleAuth";

export default function GoogleSignInButton({ onSuccess, enabled, hint, width }) {
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
        /* user cancelled or misconfigured client */
      }}
      theme="filled_black"
      size="large"
      text="signin_with"
      shape="rectangular"
      width={width || undefined}
    />
  );
}
