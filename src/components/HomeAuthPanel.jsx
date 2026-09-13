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
        Use your Google account to restore progress, notes, prove links, regenerated theory, and your Gemini API key on
        any device. The AI mentor uses the API key you save in Settings after sign-in.
      </p>
      {googleOAuthEnabled ? (
        <div className="home-auth-google-wrap">
          <GoogleSignInButton enabled onSuccess={onGoogleLogin} width={320} />
        </div>
      ) : (
        <div className="home-auth-setup">
          <p>
            Google sign-in needs a <strong>Web Client ID</strong>. Paste it in Settings, or set{" "}
            <code>VITE_GOOGLE_CLIENT_ID</code> when building the site.
          </p>
          <button type="button" className="home-cta home-cta-primary" onClick={onOpenSettings}>
            Open Settings — add Google Client ID
          </button>
        </div>
      )}
    </section>
  );
}
