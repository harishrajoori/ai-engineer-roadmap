import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { GoogleOAuthProvider, googleLogout } from "@react-oauth/google";
import { resolveGoogleClientId } from "./utils/googleAuth";
import { readJsonStorage } from "./utils/localStorage";
import confetti from "canvas-confetti";
import { invalidateCurriculumCache, loadCurriculum } from "./services/curriculumLoader";
import { CurriculumError, CurriculumLoading } from "./components/CurriculumShell";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LessonFeed from "./components/LessonFeed";
import SmartStage from "./components/SmartStage";
import CourseStage from "./components/CourseStage";
import HomeStage from "./components/HomeStage";
import Inspector from "./components/Inspector";
import { lessonsForSyllabusDisplay, ordersForTopicToggle } from "./utils/syllabusDisplay";
import SettingsModal from "./components/SettingsModal";
import RegenerateModal from "./components/RegenerateModal";
import MobileLearningBar from "./components/MobileLearningBar";
import { computeStreakDays, loadStudyDays, recordStudyDay, saveStudyDays } from "./utils/studyStreak";
import {
  flattenRegenerationsForBackup,
  importRegenerationsFromBackup,
  loadTheoryRegenerations,
  regenerationMarkdown,
  saveTheoryRegeneration,
} from "./utils/theoryRegenerationStore";
import {
  applyStudioCloudPayload,
  buildStudioCloudPayload,
  fetchStudioCloudPayload,
  isStudioCloudSyncConfigured,
  mergeStudioCloudPayload,
  pushStudioCloudPayload,
} from "./utils/studioCloudSync";

const PROGRESS_KEY = "ai_hub_react_progress";
const NOTES_KEY = "ai_hub_react_notes";
const PROVE_KEY = "ai_hub_react_prove";
const OVERRIDES_KEY = "ai_hub_react_video_overrides";
const KEYS_KEY = "ai_hub_react_api_keys";
const MODEL_KEY = "ai_hub_react_preferred_model";
const THEME_KEY = "ai_hub_react_theme";
const USER_KEY = "ai_hub_react_user";

export default function App() {
  const [progressMap, setProgressMap] = useState(() => readJsonStorage(PROGRESS_KEY, {}));
  const [notesMap, setNotesMap] = useState(() => readJsonStorage(NOTES_KEY, {}));
  const [proveMap, setProveMap] = useState(() => readJsonStorage(PROVE_KEY, {}));
  const [videoOverrides, setVideoOverrides] = useState(() => readJsonStorage(OVERRIDES_KEY, {}));
  const [regenerations, setRegenerations] = useState(() =>
    loadTheoryRegenerations(readJsonStorage(USER_KEY, null))
  );
  const [apiKeys, setApiKeys] = useState(() => readJsonStorage(KEYS_KEY, {}));
  const [preferredModel, setPreferredModel] = useState(() => localStorage.getItem(MODEL_KEY) || "gemini-2.5-flash");
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "dark");
  const [userProfile, setUserProfile] = useState(() => readJsonStorage(USER_KEY, null));
  const [studyDays, setStudyDays] = useState(() => loadStudyDays());

  const [lessonsData, setLessonsData] = useState([]);
  const [coursesRefData, setCoursesRefData] = useState({});
  const [programPrimerMarkdown, setProgramPrimerMarkdown] = useState("");
  const [programWalkthrough, setProgramWalkthrough] = useState({});
  const [glossary, setGlossary] = useState([]);
  const [curriculumReady, setCurriculumReady] = useState(false);
  const [curriculumError, setCurriculumError] = useState(null);

  const [activeCourseNum, setActiveCourseNum] = useState(0);
  const [activeLessonOrder, setActiveLessonOrder] = useState(0);
  const [currentTier, setCurrentTier] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRegenOpen, setIsRegenOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(null);
  const [courseOverviewMode, setCourseOverviewMode] = useState(false);
  const [isHomeView, setIsHomeView] = useState(() => {
    const progress = readJsonStorage(PROGRESS_KEY, {});
    return Object.keys(progress).length === 0;
  });
  const [cloudSyncStatus, setCloudSyncStatus] = useState("idle");
  const stageRef = useRef(null);
  const idTokenRef = useRef(null);
  const cloudSyncPauseRef = useRef(false);
  const hasHydratedCloudRef = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressMap));
  }, [progressMap]);
  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notesMap));
  }, [notesMap]);
  useEffect(() => {
    localStorage.setItem(PROVE_KEY, JSON.stringify(proveMap));
  }, [proveMap]);
  useEffect(() => {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(videoOverrides));
  }, [videoOverrides]);
  useEffect(() => {
    localStorage.setItem(KEYS_KEY, JSON.stringify(apiKeys));
  }, [apiKeys]);
  useEffect(() => {
    localStorage.setItem(MODEL_KEY, preferredModel);
  }, [preferredModel]);
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [userProfile]);

  const applyCurriculum = useCallback(({ lessons, coursesRef, programPrimerMarkdown: primer, programWalkthrough: walkthrough, glossary: terms }) => {
    setLessonsData(lessons);
    setCoursesRefData(coursesRef);
    setProgramPrimerMarkdown(primer || "");
    setProgramWalkthrough(walkthrough || {});
    setGlossary(terms || []);
    setActiveLessonOrder((prev) => {
      if (lessons.some((l) => l.order === prev)) {
        return prev;
      }
      return lessons[0]?.order ?? 0;
    });
    setCurriculumReady(true);
  }, []);

  const reloadCurriculum = useCallback(() => {
    invalidateCurriculumCache();
    setCurriculumError(null);
    setCurriculumReady(false);
    loadCurriculum()
      .then(applyCurriculum)
      .catch((err) => {
        setCurriculumError(err.message || "Failed to load curriculum");
      });
  }, [applyCurriculum]);

  useEffect(() => {
    setCurriculumError(null);
    loadCurriculum()
      .then(applyCurriculum)
      .catch((err) => {
        setCurriculumError(err.message || "Failed to load curriculum");
      });
  }, [applyCurriculum]);

  const courses = useMemo(() => {
    const coursesMap = new Map();
    lessonsData.forEach((l) => {
      if (!coursesMap.has(l.course)) {
        let tier = "P1";
        if (l.course === 0) {
          tier = "P0";
        } else if (l.course > 12) {
          tier = "P2";
        }
        coursesMap.set(l.course, {
          course: l.course,
          title: l.course_title,
          month: l.month,
          tier,
          lessons: []
        });
      }
      coursesMap.get(l.course).lessons.push(l);
    });
    return Array.from(coursesMap.values());
  }, [lessonsData]);

  const activeCourse = useMemo(
    () => courses.find((c) => c.course === activeCourseNum) || courses[0],
    [courses, activeCourseNum]
  );

  const courseLessons = useMemo(
    () => activeCourse?.lessons ?? [],
    [activeCourse]
  );

  const displayCourseLessons = useMemo(
    () => lessonsForSyllabusDisplay(courseLessons),
    [courseLessons]
  );

  const activeLesson = useMemo(
    () =>
      lessonsData.find((l) => l.order === activeLessonOrder) || courseLessons[0] || lessonsData[0],
    [activeLessonOrder, courseLessons, lessonsData]
  );

  const activeCourseRef = coursesRefData[activeCourseNum] || coursesRefData[String(activeCourseNum)] || {
    concepts: [],
    prompts: []
  };

  const courseProgressPct = useMemo(() => {
    if (!displayCourseLessons.length) {
      return 0;
    }
    const done = displayCourseLessons.filter((l) => {
      const keys = ordersForTopicToggle(l);
      return keys.some((order) => progressMap[order]);
    }).length;
    return Math.round((done / displayCourseLessons.length) * 100);
  }, [displayCourseLessons, progressMap]);

  const lessonNav = useMemo(() => {
    const idx = displayCourseLessons.findIndex((l) => l.order === activeLesson?.order);
    return {
      idx,
      hasPrev: idx > 0,
      hasNext: idx >= 0 && idx < displayCourseLessons.length - 1,
      prev: idx > 0 ? displayCourseLessons[idx - 1] : null,
      next: idx >= 0 && idx < displayCourseLessons.length - 1 ? displayCourseLessons[idx + 1] : null
    };
  }, [displayCourseLessons, activeLesson]);

  const totalCount = lessonsData.length;
  const completedCount = lessonsData.filter((l) => progressMap[l.order]).length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const streakDays = computeStreakDays(studyDays);
  const googleClientId = resolveGoogleClientId(apiKeys);
  const googleOAuthEnabled = Boolean(googleClientId);

  const scrollStageTop = useCallback(() => {
    if (stageRef.current) {
      stageRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

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
      videoOverrides,
      studyDays,
      preferredModel,
      apiKeys,
    ]
  );

  const handleGoogleLogin = (decodedProfile, idToken = null) => {
    if (decodedProfile?.name || decodedProfile?.email) {
      setUserProfile(decodedProfile);
      void runCloudSyncAfterLogin(decodedProfile, idToken);
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  const handleGoogleLogout = () => {
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
  };

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
    videoOverrides,
    studyDays,
    preferredModel,
    regenerations,
    apiKeys,
  ]);

  const leaveHomeView = useCallback(() => {
    setIsHomeView(false);
  }, []);

  const handleGoHome = useCallback(() => {
    setIsHomeView(true);
    setMobilePanel(null);
    scrollStageTop();
  }, [scrollStageTop]);

  const handleStartFoundation = useCallback(() => {
    leaveHomeView();
    setActiveCourseNum(0);
    setCourseOverviewMode(true);
    setMobilePanel(null);
    scrollStageTop();
  }, [leaveHomeView, scrollStageTop]);

  const handleOpenCourseFromHome = useCallback(
    (cNum) => {
      leaveHomeView();
      setActiveCourseNum(cNum);
      setCourseOverviewMode(true);
      setMobilePanel(null);
      scrollStageTop();
    },
    [leaveHomeView, scrollStageTop]
  );

  const firstStepLesson = useMemo(() => {
    const course0 = lessonsData.filter((l) => l.course === 0);
    return (
      course0.find((l) => l.is_start_here) ||
      course0.slice().sort((a, b) => a.order - b.order)[0] ||
      null
    );
  }, [lessonsData]);

  const resumeLesson = useMemo(() => {
    if (!lessonsData.length) {
      return null;
    }
    const next = lessonsData.find((l) => !progressMap[l.order]);
    return next || lessonsData[lessonsData.length - 1];
  }, [lessonsData, progressMap]);

  const handleBeginStepOne = useCallback(() => {
    if (!firstStepLesson) {
      return;
    }
    leaveHomeView();
    setActiveCourseNum(0);
    setActiveLessonOrder(firstStepLesson.order);
    setCourseOverviewMode(false);
    setMobilePanel(null);
    scrollStageTop();
  }, [firstStepLesson, leaveHomeView, scrollStageTop]);

  const handleContinueFromHome = useCallback(() => {
    if (!resumeLesson) {
      return;
    }
    leaveHomeView();
    setActiveCourseNum(resumeLesson.course);
    setActiveLessonOrder(resumeLesson.order);
    setCourseOverviewMode(false);
    setMobilePanel(null);
    scrollStageTop();
  }, [leaveHomeView, resumeLesson, scrollStageTop]);

  const handleSelectCourse = (cNum) => {
    leaveHomeView();
    setActiveCourseNum(cNum);
    setCourseOverviewMode(true);
    setMobilePanel(null);
    scrollStageTop();
  };

  const handleOpenCourseOverview = () => {
    setCourseOverviewMode(true);
    scrollStageTop();
  };

  const handleSelectLesson = (order) => {
    leaveHomeView();
    setActiveLessonOrder(order);
    setCourseOverviewMode(false);
    setMobilePanel(null);
    scrollStageTop();
  };

  const handleToggleComplete = (lessonOrOrder) => {
    const orders =
      typeof lessonOrOrder === "object" && lessonOrOrder !== null
        ? ordersForTopicToggle(lessonOrOrder)
        : [lessonOrOrder];
    const primary = orders[0];
    setProgressMap((prev) => {
      const next = !prev[primary];
      const patch = { ...prev };
      for (const order of orders) {
        if (next) {
          patch[order] = true;
        } else {
          delete patch[order];
        }
      }
      if (next) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setStudyDays((days) => {
          const updated = recordStudyDay(days);
          saveStudyDays(updated);
          return updated;
        });
      }
      return patch;
    });
  };

  const handleSaveNotes = (order, text) => {
    setNotesMap((prev) => ({ ...prev, [order]: text }));
  };

  const handleSaveProveUrl = (order, url) => {
    setProveMap((prev) => ({ ...prev, [order]: url }));
  };

  const handleSaveVideoOverride = (order, ytId) => {
    setVideoOverrides((prev) => ({ ...prev, [order]: ytId }));
  };

  const handleSaveRegeneration = (order, content, meta = {}) => {
    const next = saveTheoryRegeneration(userProfile, order, content, meta);
    setRegenerations(next);
  };

  const handleExportBackup = () => {
    const backup = {
      exported_at: new Date().toISOString(),
      user: userProfile,
      progress: progressMap,
      notes: notesMap,
      proveUrls: proveMap,
      videoOverrides,
      regenerations: flattenRegenerationsForBackup(regenerations),
      theory_regenerations: regenerations,
      studyDays,
      preferredModel
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-engineer-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportBackup = (data) => {
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
  };

  const layout = (
    <>
      <Header
        progressPct={progressPct}
        completedCount={completedCount}
        totalCount={totalCount}
        streakDays={streakDays}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        userProfile={userProfile}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
        googleOAuthEnabled={googleOAuthEnabled}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportBackup={handleExportBackup}
        onGoHome={handleGoHome}
      />

      <div
        className={`app-container ${isHomeView ? "home-view" : ""} ${mobilePanel ? `mobile-panel-${mobilePanel}` : ""}`}
      >
        <Sidebar
          courses={courses}
          activeCourseNum={activeCourseNum}
          onSelectCourse={handleSelectCourse}
          currentTier={currentTier}
          onSetTier={setCurrentTier}
          progressMap={progressMap}
        />

        <aside className="course-accordion-pane">
          <LessonFeed
            courseTitle={activeCourse?.title || `Course ${activeCourseNum}`}
            courseMonth={activeCourse?.month}
            courseProgressPct={courseProgressPct}
            lessons={courseLessons}
            activeLessonOrder={activeLessonOrder}
            courseOverviewMode={courseOverviewMode}
            onOpenCourseOverview={handleOpenCourseOverview}
            entryLessonOrder={activeCourseRef.entry_lesson_order}
            onSelectLesson={handleSelectLesson}
            onToggleComplete={handleToggleComplete}
            progressMap={progressMap}
            typeFilter={typeFilter}
            onSetTypeFilter={setTypeFilter}
          />
        </aside>

        <main className="stage" ref={stageRef}>
          {isHomeView ? (
            <HomeStage
              courses={courses}
              coursesRef={coursesRefData}
              totalCount={totalCount}
              completedCount={completedCount}
              progressPct={progressPct}
              programWalkthrough={programWalkthrough}
              onBeginStepOne={handleBeginStepOne}
              onOpenCourseOverview={handleStartFoundation}
              onOpenCourse={handleOpenCourseFromHome}
              onContinueLesson={resumeLesson ? handleContinueFromHome : undefined}
              resumeLabel={resumeLesson ? resumeLesson.lesson : ""}
              userProfile={userProfile}
              googleOAuthEnabled={googleOAuthEnabled}
              cloudSyncConfigured={isStudioCloudSyncConfigured()}
              cloudSyncStatus={cloudSyncStatus}
              onGoogleLogin={handleGoogleLogin}
              onGoogleLogout={handleGoogleLogout}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          ) : courseOverviewMode ? (
            <CourseStage
              course={activeCourse}
              courseRef={activeCourseRef}
              onSelectLesson={handleSelectLesson}
              programPrimerMarkdown={programPrimerMarkdown}
              glossary={glossary}
            />
          ) : (
          <SmartStage
            key={activeLesson?.order}
            lesson={activeLesson}
            courseRef={activeCourseRef}
            courseProgressPct={courseProgressPct}
            hasPrevLesson={lessonNav.hasPrev}
            hasNextLesson={lessonNav.hasNext}
            onPrevLesson={() => lessonNav.prev && handleSelectLesson(lessonNav.prev.order)}
            onNextLesson={() => lessonNav.next && handleSelectLesson(lessonNav.next.order)}
            isCompleted={!!progressMap[activeLesson?.order]}
            onToggleComplete={handleToggleComplete}
            videoOverrides={videoOverrides}
            onSaveVideoOverride={handleSaveVideoOverride}
            onOpenRegenerateModal={() => setIsRegenOpen(true)}
            regeneratedContent={regenerationMarkdown(regenerations, activeLesson?.order)}
            regenerationMeta={regenerations[String(activeLesson?.order)] || regenerations[activeLesson?.order]}
            proveUrl={proveMap[activeLesson?.order] || ""}
            onSaveProveUrl={handleSaveProveUrl}
          />
          )}
        </main>

        <Inspector
          lesson={isHomeView || courseOverviewMode ? null : activeLesson}
          courseRef={activeCourseRef}
          notes={notesMap}
          onSaveNotes={handleSaveNotes}
          proveUrl={proveMap[activeLesson?.order] || ""}
          onSaveProveUrl={handleSaveProveUrl}
          isCompleted={!!progressMap[activeLesson?.order]}
          onToggleComplete={handleToggleComplete}
          preferredModel={preferredModel}
          onSelectModel={setPreferredModel}
          onOpenSettings={() => setIsSettingsOpen(true)}
          apiKeys={apiKeys}
          userProfile={userProfile}
        />
      </div>

      <MobileLearningBar activePanel={mobilePanel} onSelectPanel={setMobilePanel} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        keys={apiKeys}
        onSaveKeys={setApiKeys}
        preferredModel={preferredModel}
        onSaveModel={setPreferredModel}
        userProfile={userProfile}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
        googleOAuthEnabled={googleOAuthEnabled}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      <RegenerateModal
        isOpen={isRegenOpen}
        onClose={() => setIsRegenOpen(false)}
        lesson={activeLesson}
        onSaveRegeneration={handleSaveRegeneration}
        preferredModel={preferredModel}
        apiKeys={apiKeys}
      />
    </>
  );

  if (curriculumError) {
    return <CurriculumError message={curriculumError} onRetry={reloadCurriculum} />;
  }

  if (!curriculumReady) {
    return <CurriculumLoading />;
  }

  if (googleOAuthEnabled) {
    return (
      <GoogleOAuthProvider clientId={googleClientId} key={googleClientId}>
        {layout}
      </GoogleOAuthProvider>
    );
  }

  return layout;
}
