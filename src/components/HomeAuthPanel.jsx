import React from "react";
import { Cloud, CloudOff, LogIn, LogOut, ShieldCheck } from "lucide-react";
import GoogleSignInButton from "./GoogleSignInButton";

/**
 * Home-page sign-in and cloud sync status.
 */
export default function HomeAuthPanel({
  userProfile,
  googleOAuthEnabled,
  cloudSyncConfigured,
  cloudSyncStatus = "idle",
  onGoogleLogin,
  onGoogleLogout,
  onGoogleAuthError,
  googleAuthError = "",
  onOpenSettings,
}) {
  if (userProfile) {
    return (
      <section className="home-auth-card" aria-labelledby="home-auth-heading">
        <h2 id="home-auth-heading">
          <ShieldCheck size={20} aria-hidden />
          Signed in
        </h2>
        <div className="home-auth-signed-in">
          {userProfile.avatar ? (
            <img src={userProfile.avatar} alt="" className="home-auth-avatar" width={40} height={40} />
          ) : null}
          <div className="home-auth-signed-in-text">
            <p className="home-auth-name">{userProfile.name || "Google account"}</p>
            <p className="home-auth-email">{userProfile.email}</p>
            <p className="home-auth-sync-line">
              {cloudSyncConfigured ? (
                <>
                  <Cloud size={14} aria-hidden />
                  {cloudSyncStatus === "syncing" && "Syncing progress and settings…"}
                  {cloudSyncStatus === "synced" && "Progress, notes, and API keys synced to cloud."}
                  {cloudSyncStatus === "error" && "Cloud sync failed — data is saved on this device."}
                  {cloudSyncStatus === "idle" && "Cloud sync enabled."}
                </>
              ) : (
                <>
                  <CloudOff size={14} aria-hidden />
                  Progress saved on this device. Add a cloud sync URL at build time to back up across browsers.
                </>
              )}
            </p>
          </div>
          <button type="button" className="home-cta home-cta-secondary home-auth-signout" onClick={onGoogleLogout}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="home-auth-card" aria-labelledby="home-auth-heading">
      <h2 id="home-auth-heading">
        <LogIn size={20} aria-hidden />
        Sign in to save progress everywhere
      </h2>
      <p className="home-auth-lead">
        Sign in with Google to save progress in the browser (and optionally sync across devices). This is{" "}
        <strong>not</strong> the Gemini API key — you do not need an AI Studio key to log in. Add a Gemini key in
        Settings only if you want the AI mentor.
      </p>
      {googleOAuthEnabled ? (
        <div className="home-auth-google-wrap">
          <GoogleSignInButton
            enabled
            onSuccess={onGoogleLogin}
            onAuthError={onGoogleAuthError}
            width={320}
          />
          {googleAuthError ? (
            <p className="home-auth-error" role="alert">{googleAuthError}</p>
          ) : null}
        </div>
      ) : (
        <div className="home-auth-setup">
          <p>
            The site needs a one-time <strong>OAuth Web Client ID</strong> (free from Google Cloud Console). The owner
            can add <code>public/studio-config.json</code>, set GitHub secret <code>VITE_GOOGLE_CLIENT_ID</code>, or
            paste the ID in Settings and click <strong>Save Settings</strong> before signing in.
          </p>
          <button type="button" className="home-cta home-cta-primary" onClick={onOpenSettings}>
            Open Settings — add Google Client ID
          </button>
        </div>
      )}
    </section>
  );
}
