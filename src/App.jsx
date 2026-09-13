import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { GoogleOAuthProvider, googleLogout } from "@react-oauth/google";
import { resolveGoogleClientId } from "./utils/googleAuth";
import { readJsonStorage } from "./utils/localStorage";
import confetti from "canvas-confetti";
import { loadCurriculum } from "./services/curriculumLoader";
import { CurriculumError, CurriculumLoading } from "./components/CurriculumShell";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LessonFeed from "./components/LessonFeed";
import SmartStage from "./components/SmartStage";
import Inspector from "./components/Inspector";
import SettingsModal from "./components/SettingsModal";
import RegenerateModal from "./components/RegenerateModal";
import MobileLearningBar from "./components/MobileLearningBar";
import { computeStreakDays, loadStudyDays, recordStudyDay, saveStudyDays } from "./utils/studyStreak";

const PROGRESS_KEY = "ai_hub_react_progress";
const NOTES_KEY = "ai_hub_react_notes";
const PROVE_KEY = "ai_hub_react_prove";
const OVERRIDES_KEY = "ai_hub_react_video_overrides";
const REGEN_KEY = "ai_hub_react_regenerations";
const KEYS_KEY = "ai_hub_react_api_keys";
const MODEL_KEY = "ai_hub_react_preferred_model";
const THEME_KEY = "ai_hub_react_theme";
const USER_KEY = "ai_hub_react_user";

export default function App() {
  const [progressMap, setProgressMap] = useState(() => readJsonStorage(PROGRESS_KEY, {}));
  const [notesMap, setNotesMap] = useState(() => readJsonStorage(NOTES_KEY, {}));
  const [proveMap, setProveMap] = useState(() => readJsonStorage(PROVE_KEY, {}));
  const [videoOverrides, setVideoOverrides] = useState(() => readJsonStorage(OVERRIDES_KEY, {}));
  const [regenerations, setRegenerations] = useState(() => readJsonStorage(REGEN_KEY, {}));
  const [apiKeys, setApiKeys] = useState(() => readJsonStorage(KEYS_KEY, {}));
  const [preferredModel, setPreferredModel] = useState(() => localStorage.getItem(MODEL_KEY) || "gemini-2.5-flash");
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "dark");
  const [userProfile, setUserProfile] = useState(() => readJsonStorage(USER_KEY, null));
  const [studyDays, setStudyDays] = useState(() => loadStudyDays());

  const [lessonsData, setLessonsData] = useState([]);
  const [coursesRefData, setCoursesRefData] = useState({});
  const [curriculumReady, setCurriculumReady] = useState(false);
  const [curriculumError, setCurriculumError] = useState(null);

  const [activeCourseNum, setActiveCourseNum] = useState(0);
  const [activeLessonOrder, setActiveLessonOrder] = useState(0);
  const [currentTier, setCurrentTier] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRegenOpen, setIsRegenOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(null);
  const stageRef = useRef(null);

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
    localStorage.setItem(REGEN_KEY, JSON.stringify(regenerations));
  }, [regenerations]);
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

  const applyCurriculum = useCallback(({ lessons, coursesRef }) => {
    setLessonsData(lessons);
    setCoursesRefData(coursesRef);
    setActiveLessonOrder((prev) => {
      if (lessons.some((l) => l.order === prev)) {
        return prev;
      }
      return lessons[0]?.order ?? 0;
    });
    setCurriculumReady(true);
  }, []);

  const reloadCurriculum = useCallback(() => {
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
    if (!courseLessons.length) {
      return 0;
    }
    const done = courseLessons.filter((l) => progressMap[l.order]).length;
    return Math.round((done / courseLessons.length) * 100);
  }, [courseLessons, progressMap]);

  const lessonNav = useMemo(() => {
    const idx = courseLessons.findIndex((l) => l.order === activeLesson?.order);
    return {
      idx,
      hasPrev: idx > 0,
      hasNext: idx >= 0 && idx < courseLessons.length - 1,
      prev: idx > 0 ? courseLessons[idx - 1] : null,
      next: idx >= 0 && idx < courseLessons.length - 1 ? courseLessons[idx + 1] : null
    };
  }, [courseLessons, activeLesson]);

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

  const handleGoogleLogin = (decodedProfile) => {
    if (decodedProfile?.name) {
      setUserProfile(decodedProfile);
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
    setUserProfile(null);
  };

  const handleSelectCourse = (cNum) => {
    setActiveCourseNum(cNum);
    const targetCourse = courses.find((c) => c.course === cNum);
    if (targetCourse?.lessons.length) {
      setActiveLessonOrder(targetCourse.lessons[0].order);
    }
    setMobilePanel(null);
    scrollStageTop();
  };

  const handleSelectLesson = (order) => {
    setActiveLessonOrder(order);
    setMobilePanel(null);
    scrollStageTop();
  };

  const handleToggleComplete = (order) => {
    setProgressMap((prev) => {
      const next = !prev[order];
      if (next) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setStudyDays((days) => {
          const updated = recordStudyDay(days);
          saveStudyDays(updated);
          return updated;
        });
      }
      return { ...prev, [order]: next };
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

  const handleSaveRegeneration = (order, content) => {
    setRegenerations((prev) => ({ ...prev, [order]: content }));
  };

  const handleExportBackup = () => {
    const backup = {
      exported_at: new Date().toISOString(),
      user: userProfile,
      progress: progressMap,
      notes: notesMap,
      proveUrls: proveMap,
      videoOverrides,
      regenerations,
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
    if (data.regenerations) {
      setRegenerations(data.regenerations);
    }
    if (data.user) {
      setUserProfile(data.user);
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
      />

      <div className={`app-container ${mobilePanel ? `mobile-panel-${mobilePanel}` : ""}`}>
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
            onSelectLesson={handleSelectLesson}
            onToggleComplete={handleToggleComplete}
            progressMap={progressMap}
            typeFilter={typeFilter}
            onSetTypeFilter={setTypeFilter}
          />
        </aside>

        <main className="stage" ref={stageRef}>
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
            regeneratedContent={regenerations[activeLesson?.order]}
            proveUrl={proveMap[activeLesson?.order] || ""}
            onSaveProveUrl={handleSaveProveUrl}
          />
        </main>

        <Inspector
          lesson={activeLesson}
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
