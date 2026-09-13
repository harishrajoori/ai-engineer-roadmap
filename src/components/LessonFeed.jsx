import React, { useState, useMemo } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronRight, PlayCircle, BookOpen, PenTool, ShieldCheck } from "lucide-react";

export default function LessonFeed({ lessons, completedLessons, activeLessonId, onSelectLesson }) {
  const [expandedCourses, setExpandedCourses] = useState([0]); // Default expand first course

  // Group lessons by Course
  const courseGroups = useMemo(() => {
    const groups = {};
    lessons.forEach(l => {
      if (!groups[l.course]) {
        groups[l.course] = { title: l.course_title, items: [] };
      }
      groups[l.course].items.push(l);
    });
    return groups;
  }, [lessons]);

  const toggleCourse = (cId) => {
    setExpandedCourses(prev => 
      prev.includes(cId) ? prev.filter(id => id !== cId) : [...prev, cId]
    );
  };

  const getIcon = (type) => {
    if (type === "Video") return <PlayCircle size={14} className="topic-icon text-blue-400" />;
    if (type === "Read") return <BookOpen size={14} className="topic-icon text-purple-400" />;
    if (type === "Build") return <PenTool size={14} className="topic-icon text-amber-400" />;
    if (type === "Prove") return <ShieldCheck size={14} className="topic-icon text-emerald-400" />;
    return <Circle size={14} className="topic-icon text-slate-400" />;
  };

  return (
    <div className="coursera-sidebar">
      {Object.entries(courseGroups).map(([cIdStr, course]) => {
        const cId = parseInt(cIdStr);
        const isExpanded = expandedCourses.includes(cId);
        
        return (
          <div key={cId} className="course-accordion">
            <div 
              className="course-header" 
              onClick={() => toggleCourse(cId)}
            >
              <div className="course-title-flex">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="course-title-text">{course.title}</span>
              </div>
            </div>
            
            {isExpanded && (
              <div className="course-topics-list">
                {course.items.map((lesson) => {
                  const isCompleted = completedLessons.includes(lesson.order);
                  const isActive = activeLessonId === lesson.order;
                  
                  return (
                    <div 
                      key={lesson.order}
                      onClick={() => onSelectLesson(lesson.order)}
                      className={`topic-item ${isActive ? "active" : ""}`}
                    >
                      <div className="topic-status">
                        {isCompleted ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <Circle size={16} className="text-slate-500" />
                        )}
                      </div>
                      <div className="topic-info">
                        <div className="topic-name">{lesson.lesson}</div>
                        <div className="topic-meta">
                          {getIcon(lesson.type)}
                          <span className="topic-type">{lesson.type}</span>
                          <span className="topic-duration">• {lesson.duration || "15m"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
