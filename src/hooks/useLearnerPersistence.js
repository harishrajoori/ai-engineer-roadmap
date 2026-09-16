import { useEffect, useState } from "react";
import { readJsonStorage } from "../utils/localStorage";
import {
  readPortfolioRepoUrl,
  readProveChecklistMap,
  savePortfolioRepoUrl,
  writeProveChecklistMap,
} from "../utils/proveWorkflow";
import { loadStudyDays, saveStudyDays } from "../utils/studyStreak";
import { STORAGE_KEYS } from "./storageKeys";

/**
 * Progress, notes, prove artifacts, and study streak — persisted to localStorage.
 */
export function useLearnerPersistence() {
  const [progressMap, setProgressMap] = useState(() => readJsonStorage(STORAGE_KEYS.progress, {}));
  const [notesMap, setNotesMap] = useState(() => readJsonStorage(STORAGE_KEYS.notes, {}));
  const [proveMap, setProveMap] = useState(() => readJsonStorage(STORAGE_KEYS.prove, {}));
  const [portfolioRepoUrl, setPortfolioRepoUrl] = useState(() => readPortfolioRepoUrl());
  const [proveChecklistMap, setProveChecklistMap] = useState(() => readProveChecklistMap());
  const [videoOverrides, setVideoOverrides] = useState(() =>
    readJsonStorage(STORAGE_KEYS.videoOverrides, {})
  );
  const [studyDays, setStudyDays] = useState(() => loadStudyDays());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progressMap));
  }, [progressMap]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notesMap));
  }, [notesMap]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.prove, JSON.stringify(proveMap));
  }, [proveMap]);
  useEffect(() => {
    savePortfolioRepoUrl(portfolioRepoUrl);
  }, [portfolioRepoUrl]);
  useEffect(() => {
    writeProveChecklistMap(proveChecklistMap);
  }, [proveChecklistMap]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.videoOverrides, JSON.stringify(videoOverrides));
  }, [videoOverrides]);

  return {
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
  };
}
