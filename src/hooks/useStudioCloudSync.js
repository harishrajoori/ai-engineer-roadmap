import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { googleLogout } from "@react-oauth/google";
import {
  applyStudioCloudPayload,
  buildStudioCloudPayload,
  fetchStudioCloudPayload,
  isStudioCloudSyncConfigured,
  mergeStudioCloudPayload,
  pushStudioCloudPayload,
} from "../utils/studioCloudSync";
import {
  importRegenerationsFromBackup,
  loadTheoryRegenerations,
} from "../utils/theoryRegenerationStore";

/**
 * Google login/logout and optional Cloudflare Worker sync.
 */
export function useStudioCloudSync({
  curriculumReady,
  learner,
  settings,
}) {
  const {
    progressMap,
    setProgressMap,
    notesMap,
    setNotesMap,
    proveMap,
    setProveMap,
    portfolioRepoUrl,
    setPortfolioRepoUrl,
    proveChecklistMap,
    setProveChecklistMap,
    videoOverrides,
    setVideoOverrides,
    studyDays,
    setStudyDays,
    saveStudyDays,
  } = learner;

  const {
    userProfile,
    setUserProfile,
    preferredModel,
    setPreferredModel,
    regenerations,
    setRegenerations,
    apiKeys,
    setApiKeys,
    setGoogleAuthError,
  } = settings;

  const [cloudSyncStatus, setCloudSyncStatus] = useState("idle");
  const idTokenRef = useRef(null);
  const cloudSyncPauseRef = useRef(false);
  const hasHydratedCloudRef = useRef(false);

  const runCloudSyncAfterLogin = useCallback(
    async (decodedProfile, idToken = null) => {
      if (!decodedProfile?.sub) {
        return;
      }
      hasHydratedCloudRef.current = true;
      idTokenRef.current = idToken;
      cloudSyncPauseRef.current = true;
      setCloudSyncStatus(isStudioCloudSyncConfigured() ? "syncing" : "idle");

      const localPayload = buildStudioCloudPayload({
        progressMap,
        notesMap,
        proveMap,
        portfolioRepoUrl,
        proveChecklistMap,
        videoOverrides,
        studyDays,
        preferredModel,
        regenerations: loadTheoryRegenerations(decodedProfile),
        apiKeys,
      });

      let cloudPayload = null;
      if (isStudioCloudSyncConfigured()) {
        cloudPayload = await fetchStudioCloudPayload(decodedProfile, idToken);
      }

      const merged = mergeStudioCloudPayload(localPayload, cloudPayload);
      const apply = {
        setProgressMap,
        setNotesMap,
        setProveMap,
        setVideoOverrides,
        setStudyDays,
        setPreferredModel,
        setRegenerations,
        setApiKeys,
        saveStudyDays,
        importRegenerationsFromBackup,
        userProfile: decodedProfile,
        setPortfolioRepoUrl,
        setProveChecklistMap,
      };
      const { regenerations: mergedRegen } = applyStudioCloudPayload(merged, apply);
      setRegenerations(mergedRegen);

      const localT = Date.parse(localPayload.updatedAt || 0);
      const cloudT = Date.parse(cloudPayload?.updatedAt || 0);
      if (isStudioCloudSyncConfigured() && (!cloudPayload || localT > cloudT)) {
        const pushed = await pushStudioCloudPayload(decodedProfile, merged, idToken);
        setCloudSyncStatus(pushed ? "synced" : "error");
      } else if (isStudioCloudSyncConfigured()) {
        setCloudSyncStatus("synced");
      }

      cloudSyncPauseRef.current = false;
    },
    [
      progressMap,
      notesMap,
      proveMap,
      portfolioRepoUrl,
      proveChecklistMap,
      videoOverrides,
      studyDays,
      preferredModel,
      apiKeys,
      setProgressMap,
      setNotesMap,
      setProveMap,
      setVideoOverrides,
      setStudyDays,
      setPreferredModel,
      setRegenerations,
      setApiKeys,
      setPortfolioRepoUrl,
      setProveChecklistMap,
      saveStudyDays,
    ]
  );

  const handleGoogleLogin = useCallback(
    (decodedProfile, idToken = null) => {
      if (!decodedProfile?.sub) {
        return;
      }
      setGoogleAuthError("");
      const profile = {
        ...decodedProfile,
        name: decodedProfile.name || decodedProfile.email || "Google user",
      };
      setUserProfile(profile);
      void runCloudSyncAfterLogin(profile, idToken);
      confetti({ particleCount: 50, spread: 60 });
    },
    [runCloudSyncAfterLogin, setGoogleAuthError, setUserProfile]
  );

  const handleGoogleAuthError = useCallback(
    (message) => {
      setGoogleAuthError(message || "Google sign-in failed.");
    },
    [setGoogleAuthError]
  );

  const handleGoogleLogout = useCallback(
    (googleOAuthEnabled) => {
      if (googleOAuthEnabled) {
        try {
          googleLogout();
        } catch {
          /* provider not mounted */
        }
      }
      idTokenRef.current = null;
      setCloudSyncStatus("idle");
      setUserProfile(null);
      setRegenerations(loadTheoryRegenerations(null));
    },
    [setRegenerations, setUserProfile]
  );

  useEffect(() => {
    if (!curriculumReady || hasHydratedCloudRef.current || !userProfile?.sub) {
      return;
    }
    if (!isStudioCloudSyncConfigured()) {
      hasHydratedCloudRef.current = true;
      return;
    }
    hasHydratedCloudRef.current = true;
    void runCloudSyncAfterLogin(userProfile, idTokenRef.current);
  }, [curriculumReady, userProfile, runCloudSyncAfterLogin]);

  useEffect(() => {
    if (!userProfile?.sub || cloudSyncPauseRef.current || !isStudioCloudSyncConfigured()) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setCloudSyncStatus("syncing");
      const payload = buildStudioCloudPayload({
        progressMap,
        notesMap,
        proveMap,
        portfolioRepoUrl,
        proveChecklistMap,
        videoOverrides,
        studyDays,
        preferredModel,
        regenerations,
        apiKeys,
      });
      void pushStudioCloudPayload(userProfile, payload, idTokenRef.current).then((ok) => {
        setCloudSyncStatus(ok ? "synced" : "error");
      });
    }, 2500);
    return () => clearTimeout(timer);
  }, [
    userProfile,
    progressMap,
    notesMap,
    proveMap,
    portfolioRepoUrl,
    proveChecklistMap,
    videoOverrides,
    studyDays,
    preferredModel,
    regenerations,
    apiKeys,
  ]);

  return {
    cloudSyncStatus,
    handleGoogleLogin,
    handleGoogleAuthError,
    handleGoogleLogout,
  };
}
