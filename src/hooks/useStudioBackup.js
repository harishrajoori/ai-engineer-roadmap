import { useCallback } from "react";
import {
  flattenRegenerationsForBackup,
  importRegenerationsFromBackup,
} from "../utils/theoryRegenerationStore";
import { LEARNER_STATE_SCHEMA_VERSION } from "../utils/learnerStateSchema";

/**
 * Export/import learner backup JSON.
 */
export function useStudioBackup({ learner, settings }) {
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

  const { userProfile, setUserProfile, regenerations, setRegenerations, preferredModel, setPreferredModel } =
    settings;

  const handleExportBackup = useCallback(() => {
    const backup = {
      schema_version: LEARNER_STATE_SCHEMA_VERSION,
      exported_at: new Date().toISOString(),
      user: userProfile,
      progress: progressMap,
      notes: notesMap,
      proveUrls: proveMap,
      portfolioRepoUrl,
      proveChecklistMap,
      videoOverrides,
      regenerations: flattenRegenerationsForBackup(regenerations),
      theory_regenerations: regenerations,
      studyDays,
      preferredModel,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-engineer-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }, [
    userProfile,
    progressMap,
    notesMap,
    proveMap,
    portfolioRepoUrl,
    proveChecklistMap,
    videoOverrides,
    regenerations,
    studyDays,
    preferredModel,
  ]);

  const handleImportBackup = useCallback(
    (data) => {
      const profileForImport = data.user || userProfile;
      if (data.user) {
        setUserProfile(data.user);
      }
      if (data.progress) {
        setProgressMap(data.progress);
      }
      if (data.notes) {
        setNotesMap(data.notes);
      }
      if (data.proveUrls) {
        setProveMap(data.proveUrls);
      }
      if (typeof data.portfolioRepoUrl === "string") {
        setPortfolioRepoUrl(data.portfolioRepoUrl);
      }
      if (data.proveChecklistMap && typeof data.proveChecklistMap === "object") {
        setProveChecklistMap(data.proveChecklistMap);
      }
      if (data.videoOverrides) {
        setVideoOverrides(data.videoOverrides);
      }
      if (data.theory_regenerations) {
        setRegenerations(importRegenerationsFromBackup(profileForImport, data.theory_regenerations));
      } else if (data.regenerations) {
        setRegenerations(importRegenerationsFromBackup(profileForImport, data.regenerations));
      }
      if (data.studyDays) {
        setStudyDays(data.studyDays);
        saveStudyDays(data.studyDays);
      }
      if (data.preferredModel) {
        setPreferredModel(data.preferredModel);
      }
    },
    [
      userProfile,
      setUserProfile,
      setProgressMap,
      setNotesMap,
      setProveMap,
      setPortfolioRepoUrl,
      setProveChecklistMap,
      setVideoOverrides,
      setRegenerations,
      setStudyDays,
      saveStudyDays,
      setPreferredModel,
    ]
  );

  return { handleExportBackup, handleImportBackup };
}
