import { useCallback, useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import {
  filterSyllabusLessons,
  lessonsForSyllabusDisplay,
  ordersForTopicToggle,
} from "../utils/syllabusDisplay";
import { computeNextAction } from "../utils/nextAction";
import { courseWeightedProgressPct, programWeightedProgressPct } from "../utils/learningProgress";
import { recordStudyDay } from "../utils/studyStreak";
import { readJsonStorage } from "../utils/localStorage";
import { STORAGE_KEYS } from "./storageKeys";

/**
 * Course/lesson selection, home view, and derived lesson navigation.
 */
export function useStudioNavigation({
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
}) {
  const [activeCourseNum, setActiveCourseNum] = useState(0);
  const [currentTier, setCurrentTier] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [requiredOnlyFilter, setRequiredOnlyFilter] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.syllabusRequiredOnly);
      if (stored === "true" || stored === "false") {
        return stored === "true";
      }
    } catch {
      /* ignore */
    }
    return true;
  });
  const [mobilePanel, setMobilePanel] = useState(null);
  const [courseOverviewMode, setCourseOverviewMode] = useState(false);
  const [isHomeView, setIsHomeView] = useState(() => {
    const progress = readJsonStorage(STORAGE_KEYS.progress, {});
    return Object.keys(progress).length === 0;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.syllabusRequiredOnly, requiredOnlyFilter ? "true" : "false");
  }, [requiredOnlyFilter]);

  const scrollStageTop = useCallback(() => {
    if (stageRef.current) {
      stageRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [stageRef]);

  const leaveHomeView = useCallback(() => {
    setIsHomeView(false);
  }, []);

  const activeCourse = useMemo(
    () => courses.find((c) => c.course === activeCourseNum) || courses[0],
    [courses, activeCourseNum]
  );

  const courseLessons = useMemo(() => activeCourse?.lessons ?? [], [activeCourse]);

  const displayCourseLessons = useMemo(
    () => lessonsForSyllabusDisplay(courseLessons),
    [courseLessons]
  );

  const activeLesson = useMemo(
    () =>
      lessonsData.find((l) => l.order === activeLessonOrder) ||
      courseLessons[0] ||
      lessonsData[0],
    [activeLessonOrder, courseLessons, lessonsData]
  );

  const activeCourseRef = coursesRefData[activeCourseNum] ||
    coursesRefData[String(activeCourseNum)] || {
      concepts: [],
      prompts: [],
    };

  const courseProgressPct = useMemo(
    () =>
      courseWeightedProgressPct(
        displayCourseLessons,
        progressMap,
        coursesRefData,
        activeCourseNum,
        proveChecklistMap
      ),
    [displayCourseLessons, progressMap, coursesRefData, activeCourseNum, proveChecklistMap]
  );

  const filteredCourseLessons = useMemo(
    () => filterSyllabusLessons(displayCourseLessons, { requiredOnly: requiredOnlyFilter, typeFilter: "all" }),
    [displayCourseLessons, requiredOnlyFilter]
  );

  const lessonNav = useMemo(() => {
    const idx = filteredCourseLessons.findIndex((l) => l.order === activeLesson?.order);
    return {
      idx,
      hasPrev: idx > 0,
      hasNext: idx >= 0 && idx < filteredCourseLessons.length - 1,
      prev: idx > 0 ? filteredCourseLessons[idx - 1] : null,
      next: idx >= 0 && idx < filteredCourseLessons.length - 1 ? filteredCourseLessons[idx + 1] : null,
    };
  }, [filteredCourseLessons, activeLesson]);

  const totalCount = lessonsData.length;
  const completedCount = lessonsData.filter((l) => progressMap[l.order]).length;
  const progressPct = useMemo(() => {
    const courseRows = courses.map((c) => ({
      courseId: c.course,
      displayLessons: lessonsForSyllabusDisplay(c.lessons || []),
    }));
    return programWeightedProgressPct(courseRows, coursesRefData, progressMap, proveChecklistMap);
  }, [courses, coursesRefData, progressMap, proveChecklistMap]);

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

  const nextAction = useMemo(
    () => computeNextAction(lessonsData, coursesRefData, progressMap, proveChecklistMap),
    [lessonsData, coursesRefData, progressMap, proveChecklistMap]
  );

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

  const handleOpenLessonFromHome = useCallback(
    (lesson) => {
      if (!lesson) {
        return;
      }
      leaveHomeView();
      setActiveCourseNum(lesson.course);
      setActiveLessonOrder(lesson.order);
      setCourseOverviewMode(false);
      setMobilePanel(null);
      scrollStageTop();
    },
    [leaveHomeView, scrollStageTop, setActiveLessonOrder]
  );

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
  }, [firstStepLesson, leaveHomeView, scrollStageTop, setActiveLessonOrder]);

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
  }, [leaveHomeView, resumeLesson, scrollStageTop, setActiveLessonOrder]);

  const handleSelectCourse = useCallback(
    (cNum) => {
      leaveHomeView();
      setActiveCourseNum(cNum);
      setCourseOverviewMode(true);
      setMobilePanel(null);
      scrollStageTop();
    },
    [leaveHomeView, scrollStageTop]
  );

  const handleOpenCourseOverview = useCallback(() => {
    setCourseOverviewMode(true);
    scrollStageTop();
  }, [scrollStageTop]);

  const handleSelectLesson = useCallback(
    (order) => {
      leaveHomeView();
      setActiveLessonOrder(order);
      setCourseOverviewMode(false);
      setMobilePanel(null);
      scrollStageTop();
    },
    [leaveHomeView, scrollStageTop, setActiveLessonOrder]
  );

  const handleToggleComplete = useCallback(
    (lessonOrOrder) => {
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
    },
    [setProgressMap, setStudyDays, saveStudyDays]
  );

  return {
    activeCourseNum,
    activeCourse,
    activeCourseRef,
    activeLesson,
    courseLessons,
    courseProgressPct,
    lessonNav,
    totalCount,
    completedCount,
    progressPct,
    nextAction,
    resumeLesson,
    firstStepLesson,
    currentTier,
    setCurrentTier,
    typeFilter,
    setTypeFilter,
    requiredOnlyFilter,
    setRequiredOnlyFilter,
    mobilePanel,
    setMobilePanel,
    courseOverviewMode,
    setCourseOverviewMode,
    isHomeView,
    handleGoHome,
    handleStartFoundation,
    handleOpenCourseFromHome,
    handleOpenLessonFromHome,
    handleBeginStepOne,
    handleContinueFromHome,
    handleSelectCourse,
    handleOpenCourseOverview,
    handleSelectLesson,
    handleToggleComplete,
  };
}
