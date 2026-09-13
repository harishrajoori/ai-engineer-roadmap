import React from "react";
import { Layers, List, Bot, PanelRight } from "lucide-react";

export default function MobileLearningBar({ activePanel, onSelectPanel }) {
  const items = [
    { id: "courses", label: "Courses", icon: Layers },
    { id: "syllabus", label: "Topics", icon: List },
    { id: "mentor", label: "Mentor", icon: Bot },
    { id: null, label: "Learn", icon: PanelRight }
  ];

  return (
    <nav className="mobile-learning-bar" aria-label="Mobile navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const isLearn = item.id === null;
        const active = !isLearn && activePanel === item.id;
        return (
          <button
            key={item.label}
            type="button"
            className={`mobile-learning-btn ${active ? "active" : ""} ${isLearn ? "learn" : ""}`}
            onClick={() => (isLearn ? onSelectPanel(null) : onSelectPanel(item.id))}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
