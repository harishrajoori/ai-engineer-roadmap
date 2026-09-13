import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { LESSONS_DATA, COURSES_REF_DATA } from "./data/lessonsData";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LessonFeed from "./components/LessonFeed";
import SmartStage from "./components/SmartStage";
import Inspector from "./components/Inspector";
import SettingsModal from "./components/SettingsModal";
import RegenerateModal from "./components/RegenerateModal";

export default function App() {
  // Persistence Keys
  const PROGRESS_KEY = "ai_hub_react_progress";
  const NOTES_KEY = "ai_hub_react_notes";
  const PROVE_KEY = "ai_hub_react_prove";
  const OVERRIDES_KEY = "ai_hub_react_video_overrides";
  const REGEN_KEY = "ai_hub_react_regenerations";
  const KEYS_KEY = "ai_hub_react_api_keys";
  const MODEL_KEY = "ai_hub_react_preferred_model";
  const THEME_KEY = "ai_hub_react_theme";
  const USER_KEY = "ai_hub_react_user";

  // State
  const [progressMap, setProgressMap] = useState(() => {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  });
  const [notesMap, setNotesMap] = useState(() => {
    return JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
  });
  const [proveMap, setProveMap] = useState(() => {
    return JSON.parse(localStorage.getItem(PROVE_KEY) || "{}");
  });
  const [videoOverrides, setVideoOverrides] = useState(() => {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}");
  });
  const [regenerations, setRegenerations] = useState(() => {
    return JSON.parse(localStorage.getItem(REGEN_KEY) || "{}");
  });
  const [apiKeys, setApiKeys] = useState(() => {
    return JSON.parse(localStorage.getItem(KEYS_KEY) || "{}");
  });
  const [preferredModel, setPreferredModel] = useState(() => {
    return localStorage.getItem(MODEL_KEY) || "gemini-2.5-flash";
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || "dark";
  });
  const [userProfile, setUserProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  });

  const [activeCourseNum, setActiveCourseNum] = useState(0);
  const [activeLessonOrder, setActiveLessonOrder] = useState(0);
  const [currentTier, setCurrentTier] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRegenOpen, setIsRegenOpen] = useState(false);
  const stageRef = useRef(null);

  // Sync Theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Sync to localStorage
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

  // Derived Courses Map
  const coursesMap = new Map();
  LESSONS_DATA.forEach((l) => {
    if (!coursesMap.has(l.course)) {
      let tier = "P1";
      if (l.course === 0) tier = "P0";
      else if (l.course > 12) tier = "P2";

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
  const courses = Array.from(coursesMap.values());

  // Active Lesson & Active Course Lessons
  const activeCourse = courses.find((c) => c.course === activeCourseNum) || courses[0];
  const courseLessons = activeCourse?.lessons || [];
  const activeLesson = LESSONS_DATA.find((l) => l.order === activeLessonOrder) || courseLessons[0] || LESSONS_DATA[0];
  const activeCourseRef = COURSES_REF_DATA[activeCourseNum] || { concepts: [], prompts: [] };

  // Global Progress
  const totalCount = LESSONS_DATA.length;
  const completedCount = LESSONS_DATA.filter((l) => progressMap[l.order]).length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Handlers
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleGoogleLogin = () => {
    const inputName = prompt("Enter your Name for Google Cloud Profile Sync:", userProfile?.name || "Harish Rajoori");
    if (!inputName) return;
    const inputEmail = prompt("Enter your Google Account Email:", userProfile?.email || "harish.rajoori@gmail.com");
    if (!inputEmail) return;

    setUserProfile({
      name: inputName,
      email: inputEmail,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(inputName)}`
    });
    confetti({ particleCount: 50, spread: 60 });
  };

  const handleGoogleLogout = () => {
    setUserProfile(null);
  };

  const handleSelectCourse = (cNum) => {
    setActiveCourseNum(cNum);
    const targetCourse = courses.find((c) => c.course === cNum);
    if (targetCourse && targetCourse.lessons.length > 0) {
      setActiveLessonOrder(targetCourse.lessons[0].order);
    }
    if (stageRef.current) {
      stageRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSelectLesson = (order) => {
    setActiveLessonOrder(order);
    if (stageRef.current) {
      stageRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleToggleComplete = (order) => {
    setProgressMap((prev) => {
      const next = !prev[order];
      if (next) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
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
      regenerations
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-engineer-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportBackup = (data) => {
    if (data.progress) setProgressMap(data.progress);
    if (data.notes) setNotesMap(data.notes);
    if (data.proveUrls) setProveMap(data.proveUrls);
    if (data.videoOverrides) setVideoOverrides(data.videoOverrides);
    if (data.regenerations) setRegenerations(data.regenerations);
    if (data.user) setUserProfile(data.user);
  };

  return (
    <>
      <Header
        progressPct={progressPct}
        completedCount={completedCount}
        totalCount={totalCount}
        streakDays={5}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        userProfile={userProfile}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportBackup={handleExportBackup}
      />

      <div className="app-container">
        {/* Left Sidebar */}
        <Sidebar
          courses={courses}
          activeCourseNum={activeCourseNum}
          onSelectCourse={handleSelectCourse}
          currentTier={currentTier}
          onSetTier={setCurrentTier}
          progressMap={progressMap}
        />

        {/* Center Stage */}
        <main className="stage" ref={stageRef}>
          <SmartStage
            lesson={activeLesson}
            isCompleted={!!progressMap[activeLesson?.order]}
            onToggleComplete={handleToggleComplete}
            videoOverrides={videoOverrides}
            onSaveVideoOverride={handleSaveVideoOverride}
            onOpenRegenerateModal={() => setIsRegenOpen(true)}
            regeneratedContent={regenerations[activeLesson?.order]}
          />

          <LessonFeed
            courseTitle={activeCourse?.title || `Course ${activeCourseNum}`}
            lessons={courseLessons}
            activeLessonOrder={activeLessonOrder}
            onSelectLesson={handleSelectLesson}
            onToggleComplete={handleToggleComplete}
            progressMap={progressMap}
            typeFilter={typeFilter}
            onSetTypeFilter={setTypeFilter}
          />
        </main>

        {/* Right Inspector */}
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
        />
      </div>

      {/* Modals */}
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
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      <RegenerateModal
        isOpen={isRegenOpen}
        onClose={() => setIsRegenOpen(false)}
        lesson={activeLesson}
        onSaveRegeneration={handleSaveRegeneration}
        preferredModel={preferredModel}
      />
    </>
  );
}
