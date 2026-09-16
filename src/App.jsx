import React, { useRef } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { resolveGoogleClientId } from "./utils/googleAuth";
import { CurriculumError, CurriculumLoading } from "./components/CurriculumShell";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LessonFeed from "./components/LessonFeed";
import SmartStage from "./components/SmartStage";
import CourseStage from "./components/CourseStage";
import HomeStage from "./components/HomeStage";
import Inspector from "./components/Inspector";
import SettingsModal from "./components/SettingsModal";
import RegenerateModal from "./components/RegenerateModal";
import MobileLearningBar from "./components/MobileLearningBar";
import TopicSearchModal from "./components/TopicSearchModal";
import { computeStreakDays } from "./utils/studyStreak";
import {
  regenerationMarkdown,
  saveTheoryRegeneration,
} from "./utils/theoryRegenerationStore";
import {
  clamp,
  gridTemplateColumnsForLayout,
  layoutContainerClass,
} from "./utils/learningLayout";
import ColumnResizeHandle from "./components/ColumnResizeHandle";
import { isStudioCloudSyncConfigured } from "./utils/studioCloudSync";
import { useLearnerPersistence } from "./hooks/useLearnerPersistence";
import { useStudioSettings } from "./hooks/useStudioSettings";
import { useCurriculum } from "./hooks/useCurriculum";
import { useStudioCloudSync } from "./hooks/useStudioCloudSync";
import { useStudioNavigation } from "./hooks/useStudioNavigation";
import { useStudioBackup } from "./hooks/useStudioBackup";

export default function App() {
  const learner = useLearnerPersistence();
  const settings = useStudioSettings();
  const curriculum = useCurriculum();
  const stageRef = useRef(null);

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
    apiKeys,
    setApiKeys,
    preferredModel,
    setPreferredModel,
    theme,
    toggleTheme,
    userProfile,
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
    isTopicSearchOpen,
    setIsTopicSearchOpen,
  } = settings;

  const {
    lessonsData,
    coursesRefData,
    programPrimerMarkdown,
    programBriefMarkdown,
    programBriefHomeMarkdown,
    programWalkthrough,
    glossary,
    portfolioStarter,
    curriculumReady,
    curriculumError,
    reloadCurriculum,
    courses,
    activeLessonOrder,
    setActiveLessonOrder,
  } = curriculum;

  const { cloudSyncStatus, handleGoogleLogin, handleGoogleAuthError, handleGoogleLogout } =
    useStudioCloudSync({
      curriculumReady,
      learner,
      settings,
    });

  const nav = useStudioNavigation({
    lessonsData,
    courses,
    coursesRefData,
    progressMap,
    proveChecklistMap,
    setProgressMap,
    setStudyDays,
    saveStudyDays,
    activeLessonOrder,
    setActiveLessonOrder,
    stageRef,
  });

  const { handleExportBackup, handleImportBackup } = useStudioBackup({ learner, settings });

  const streakDays = computeStreakDays(studyDays);
  const googleClientId = resolveGoogleClientId(apiKeys, runtimeStudioConfig);
  const googleOAuthEnabled = Boolean(googleClientId);

  const onGoogleLogout = () => handleGoogleLogout(googleOAuthEnabled);

  const handleSaveNotes = (order, text) => {
    setNotesMap((prev) => ({ ...prev, [order]: text }));
  };

  const handleSaveProveUrl = (order, url) => {
    setProveMap((prev) => ({ ...prev, [order]: url }));
  };

  const handleProveChecklistChange = (nextMap) => {
    setProveChecklistMap(nextMap);
  };

  const handleSaveVideoOverride = (order, ytId) => {
    setVideoOverrides((prev) => ({ ...prev, [order]: ytId }));
  };

  const handleSaveRegeneration = (order, content, meta = {}) => {
    const next = saveTheoryRegeneration(userProfile, order, content, meta);
    setRegenerations(next);
  };

  const layout = (
    <>
      <Header
        progressPct={nav.progressPct}
        completedCount={nav.completedCount}
        totalCount={nav.totalCount}
        streakDays={streakDays}
        theme={theme}
        onToggleTheme={toggleTheme}
        userProfile={userProfile}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={onGoogleLogout}
        onGoogleAuthError={handleGoogleAuthError}
        googleOAuthEnabled={googleOAuthEnabled}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportBackup={handleExportBackup}
        onGoHome={nav.handleGoHome}
        onOpenTopicSearch={() => setIsTopicSearchOpen(true)}
      />

      <div
        className={`app-container ${nav.isHomeView ? "home-view" : ""} ${nav.mobilePanel ? `mobile-panel-${nav.mobilePanel}` : ""} ${!nav.isHomeView ? layoutContainerClass(learningLayout) : ""} ${!nav.isHomeView && resizableDesktopGrid ? "layout-custom-columns" : ""}`}
        style={
          !nav.isHomeView && resizableDesktopGrid
            ? { gridTemplateColumns: gridTemplateColumnsForLayout(learningLayout) }
            : undefined
        }
      >
        <div className="layout-cell layout-cell-nav">
          {resizableDesktopGrid && learningLayout.curriculumOpen && (
            <ColumnResizeHandle
              side="right"
              label="Resize curriculum modules column"
              onResizeDelta={(dx) =>
                setLearningLayout((prev) => ({
                  ...prev,
                  navWidth: clamp(prev.navWidth + dx, 180, 360),
                }))
              }
            />
          )}
          <Sidebar
            courses={courses}
            activeCourseNum={nav.activeCourseNum}
            onSelectCourse={nav.handleSelectCourse}
            currentTier={nav.currentTier}
            onSetTier={nav.setCurrentTier}
            progressMap={progressMap}
          />
        </div>

        <div className="layout-cell layout-cell-syllabus">
          {resizableDesktopGrid && learningLayout.curriculumOpen && (
            <ColumnResizeHandle
              side="right"
              label="Resize syllabus column"
              onResizeDelta={(dx) =>
                setLearningLayout((prev) => ({
                  ...prev,
                  syllabusWidth: clamp(prev.syllabusWidth + dx, 220, 480),
                }))
              }
            />
          )}
          <aside className="course-accordion-pane">
            <LessonFeed
              courseTitle={nav.activeCourse?.title || `Course ${nav.activeCourseNum}`}
              courseMonth={nav.activeCourse?.month}
              courseProgressPct={nav.courseProgressPct}
              lessons={nav.courseLessons}
              activeLessonOrder={activeLessonOrder}
              courseOverviewMode={nav.courseOverviewMode}
              onOpenCourseOverview={nav.handleOpenCourseOverview}
              entryLessonOrder={nav.activeCourseRef.entry_lesson_order}
              onSelectLesson={nav.handleSelectLesson}
              onToggleComplete={nav.handleToggleComplete}
              progressMap={progressMap}
              typeFilter={nav.typeFilter}
              onSetTypeFilter={nav.setTypeFilter}
              requiredOnlyFilter={nav.requiredOnlyFilter}
              onSetRequiredOnlyFilter={nav.setRequiredOnlyFilter}
              nextAction={nav.nextAction}
              onOpenLessonFromNextAction={(lesson) => nav.handleSelectLesson(lesson.order)}
            />
          </aside>
        </div>

        <main className="stage" ref={stageRef}>
          {nav.isHomeView ? (
            <HomeStage
              courses={courses}
              coursesRef={coursesRefData}
              totalCount={nav.totalCount}
              completedCount={nav.completedCount}
              progressPct={nav.progressPct}
              programWalkthrough={programWalkthrough}
              programBriefMarkdown={programBriefMarkdown}
              programBriefHomeMarkdown={programBriefHomeMarkdown}
              onBeginStepOne={nav.handleBeginStepOne}
              onOpenCourseOverview={nav.handleStartFoundation}
              onOpenCourse={nav.handleOpenCourseFromHome}
              onContinueLesson={nav.resumeLesson ? nav.handleContinueFromHome : undefined}
              resumeLabel={nav.resumeLesson ? nav.resumeLesson.lesson : ""}
              userProfile={userProfile}
              googleOAuthEnabled={googleOAuthEnabled}
              cloudSyncConfigured={isStudioCloudSyncConfigured()}
              cloudSyncStatus={cloudSyncStatus}
              onGoogleLogin={handleGoogleLogin}
              onGoogleLogout={onGoogleLogout}
              onGoogleAuthError={handleGoogleAuthError}
              googleAuthError={googleAuthError}
              onOpenSettings={() => setIsSettingsOpen(true)}
              nextAction={nav.nextAction}
              proveChecklistMap={proveChecklistMap}
              portfolioRepoUrl={portfolioRepoUrl}
              onPortfolioRepoChange={setPortfolioRepoUrl}
              onOpenLessonFromHome={nav.handleOpenLessonFromHome}
              progressMap={progressMap}
              lessons={lessonsData}
              proveMap={proveMap}
            />
          ) : nav.courseOverviewMode ? (
            <CourseStage
              course={nav.activeCourse}
              courseRef={nav.activeCourseRef}
              onSelectLesson={nav.handleSelectLesson}
              programPrimerMarkdown={programPrimerMarkdown}
              glossary={glossary}
              learningLayout={learningLayout}
              onLearningLayoutChange={setLearningLayout}
              isWideDesktop={resizableDesktopGrid}
              mobilePanel={nav.mobilePanel}
              onMobilePanelChange={nav.setMobilePanel}
              requiredOnlyFilter={nav.requiredOnlyFilter}
            />
          ) : (
            <SmartStage
              key={nav.activeLesson?.order}
              lesson={nav.activeLesson}
              courseRef={nav.activeCourseRef}
              courseProgressPct={nav.courseProgressPct}
              hasPrevLesson={nav.lessonNav.hasPrev}
              hasNextLesson={nav.lessonNav.hasNext}
              onPrevLesson={() => nav.lessonNav.prev && nav.handleSelectLesson(nav.lessonNav.prev.order)}
              onNextLesson={() => nav.lessonNav.next && nav.handleSelectLesson(nav.lessonNav.next.order)}
              isCompleted={!!progressMap[nav.activeLesson?.order]}
              onToggleComplete={nav.handleToggleComplete}
              videoOverrides={videoOverrides}
              onSaveVideoOverride={handleSaveVideoOverride}
              onOpenRegenerateModal={() => setIsRegenOpen(true)}
              regeneratedContent={regenerationMarkdown(regenerations, nav.activeLesson?.order)}
              regenerationMeta={
                regenerations[String(nav.activeLesson?.order)] || regenerations[nav.activeLesson?.order]
              }
              proveUrl={proveMap[nav.activeLesson?.order] || ""}
              onSaveProveUrl={handleSaveProveUrl}
              portfolioRepoUrl={portfolioRepoUrl}
              onSavePortfolioRepoUrl={setPortfolioRepoUrl}
              proveChecklistMap={proveChecklistMap}
              onProveChecklistChange={handleProveChecklistChange}
              portfolioStarter={portfolioStarter}
              learningLayout={learningLayout}
              onLearningLayoutChange={setLearningLayout}
              isWideDesktop={resizableDesktopGrid}
              mobilePanel={nav.mobilePanel}
              onMobilePanelChange={nav.setMobilePanel}
              nextAction={nav.nextAction}
              onOpenLessonFromNextAction={(lesson) => nav.handleSelectLesson(lesson.order)}
            />
          )}
        </main>

        <div className="layout-cell layout-cell-mentor">
          {resizableDesktopGrid && !nav.isHomeView && learningLayout.mentorOpen !== false && (
            <ColumnResizeHandle
              side="left"
              label="Drag to resize chat panel"
              onResizeDelta={(dx) =>
                setLearningLayout((prev) => ({
                  ...prev,
                  mentorWidth: clamp(prev.mentorWidth - dx, 300, 960),
                }))
              }
            />
          )}
          <Inspector
            lesson={nav.isHomeView || nav.courseOverviewMode ? null : nav.activeLesson}
            courseRef={nav.activeCourseRef}
            onOpenEntryTopic={(order) => nav.handleSelectLesson(order)}
            notes={notesMap}
            onSaveNotes={handleSaveNotes}
            proveUrl={proveMap[nav.activeLesson?.order] || ""}
            onSaveProveUrl={handleSaveProveUrl}
            isCompleted={!!progressMap[nav.activeLesson?.order]}
            onToggleComplete={nav.handleToggleComplete}
            preferredModel={preferredModel}
            onSelectModel={setPreferredModel}
            onOpenSettings={() => setIsSettingsOpen(true)}
            apiKeys={apiKeys}
            userProfile={userProfile}
            learningLayout={learningLayout}
            onLearningLayoutChange={setLearningLayout}
            portfolioRepoUrl={portfolioRepoUrl}
            proveChecklistMap={proveChecklistMap}
          />
        </div>
      </div>

      {!nav.isHomeView && nav.mobilePanel && (
        <button
          type="button"
          className="mobile-panel-backdrop"
          aria-label="Close panel and focus on content"
          onClick={() => nav.setMobilePanel(null)}
        />
      )}

      <MobileLearningBar activePanel={nav.mobilePanel} onSelectPanel={nav.setMobilePanel} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        keys={apiKeys}
        onSaveKeys={setApiKeys}
        preferredModel={preferredModel}
        onSaveModel={setPreferredModel}
        userProfile={userProfile}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={onGoogleLogout}
        onGoogleAuthError={handleGoogleAuthError}
        googleAuthError={googleAuthError}
        runtimeStudioConfig={runtimeStudioConfig}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      <RegenerateModal
        isOpen={isRegenOpen}
        onClose={() => setIsRegenOpen(false)}
        lesson={nav.activeLesson}
        onSaveRegeneration={handleSaveRegeneration}
        preferredModel={preferredModel}
        apiKeys={apiKeys}
      />

      <TopicSearchModal
        isOpen={isTopicSearchOpen}
        onClose={() => setIsTopicSearchOpen(false)}
        lessons={lessonsData}
        coursesRef={coursesRefData}
        onSelectLesson={nav.handleOpenLessonFromHome}
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
