import { useEffect, useState } from "react";
import { readJsonStorage } from "../utils/localStorage";
import { normalizePreferredModel } from "../services/aiService";
import { loadTheoryRegenerations } from "../utils/theoryRegenerationStore";
import {
  persistLearningLayout,
  readLearningLayout,
} from "../utils/learningLayout";
import { loadStudioRuntimeConfig } from "../utils/studioRuntimeConfig";
import { STORAGE_KEYS } from "./storageKeys";

/**
 * Theme, API keys, model, user profile, theory regenerations, layout, runtime config.
 */
export function useStudioSettings() {
  const [apiKeys, setApiKeys] = useState(() => readJsonStorage(STORAGE_KEYS.apiKeys, {}));
  const [preferredModel, setPreferredModel] = useState(() =>
    normalizePreferredModel(localStorage.getItem(STORAGE_KEYS.preferredModel))
  );
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.theme) || "dark");
  const [userProfile, setUserProfile] = useState(() => readJsonStorage(STORAGE_KEYS.user, null));
  const [regenerations, setRegenerations] = useState(() =>
    loadTheoryRegenerations(readJsonStorage(STORAGE_KEYS.user, null))
  );
  const [learningLayout, setLearningLayout] = useState(() => readLearningLayout());
  const [resizableDesktopGrid, setResizableDesktopGrid] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1181px)").matches
  );
  const [runtimeStudioConfig, setRuntimeStudioConfig] = useState({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRegenOpen, setIsRegenOpen] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState("");
  const [isTopicSearchOpen, setIsTopicSearchOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.preferredModel, preferredModel);
  }, [preferredModel]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userProfile));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  }, [userProfile]);

  useEffect(() => {
    void loadStudioRuntimeConfig().then(setRuntimeStudioConfig);
  }, []);

  useEffect(() => {
    persistLearningLayout(learningLayout);
  }, [learningLayout]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1181px)");
    const onChange = () => setResizableDesktopGrid(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return {
    apiKeys,
    setApiKeys,
    preferredModel,
    setPreferredModel,
    theme,
    setTheme,
    toggleTheme,
    userProfile,
    setUserProfile,
    regenerations,
    setRegenerations,
    learningLayout,
    setLearningLayout,
    resizableDesktopGrid,
    runtimeStudioConfig,
    isSettingsOpen,
    setIsSettingsOpen,
    isRegenOpen,
    setIsRegenOpen,
    googleAuthError,
    setGoogleAuthError,
    isTopicSearchOpen,
    setIsTopicSearchOpen,
  };
}
