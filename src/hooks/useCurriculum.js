import { useCallback, useEffect, useMemo, useState } from "react";
import { invalidateCurriculumCache, loadCurriculum } from "../services/curriculumLoader";

/**
 * Load lessons.json bundle and derive course list.
 */
export function useCurriculum() {
  const [lessonsData, setLessonsData] = useState([]);
  const [coursesRefData, setCoursesRefData] = useState({});
  const [programPrimerMarkdown, setProgramPrimerMarkdown] = useState("");
  const [programBriefMarkdown, setProgramBriefMarkdown] = useState("");
  const [programBriefHomeMarkdown, setProgramBriefHomeMarkdown] = useState("");
  const [programWalkthrough, setProgramWalkthrough] = useState({});
  const [glossary, setGlossary] = useState([]);
  const [portfolioStarter, setPortfolioStarter] = useState(null);
  const [curriculumReady, setCurriculumReady] = useState(false);
  const [curriculumError, setCurriculumError] = useState(null);
  const [activeLessonOrder, setActiveLessonOrder] = useState(0);

  const applyCurriculum = useCallback(
    ({
      lessons,
      coursesRef,
      programPrimerMarkdown: primer,
      programBriefMarkdown: brief,
      programBriefHomeMarkdown: briefHome,
      programWalkthrough: walkthrough,
      glossary: terms,
      portfolioStarter: starter,
    }) => {
      setLessonsData(lessons);
      setCoursesRefData(coursesRef);
      setProgramPrimerMarkdown(primer || "");
      setProgramBriefMarkdown(brief || "");
      setProgramBriefHomeMarkdown(briefHome || brief || "");
      setProgramWalkthrough(walkthrough || {});
      setGlossary(terms || []);
      setPortfolioStarter(starter || null);
      setActiveLessonOrder((prev) => {
        if (lessons.some((l) => l.order === prev)) {
          return prev;
        }
        return lessons[0]?.order ?? 0;
      });
      setCurriculumReady(true);
    },
    []
  );

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
          lessons: [],
        });
      }
      coursesMap.get(l.course).lessons.push(l);
    });
    return Array.from(coursesMap.values());
  }, [lessonsData]);

  return {
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
  };
}
