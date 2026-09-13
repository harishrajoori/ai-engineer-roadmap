import React from "react";

/**
 * Drag handle to resize adjacent grid columns (desktop).
 */
export default function ColumnResizeHandle({ side = "left", label = "Drag to resize", onResizeDelta }) {
  const onPointerDown = (event) => {
    event.preventDefault();
    const startX = event.clientX;
    let lastX = startX;

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - lastX;
      lastX = moveEvent.clientX;
      if (dx !== 0) {
        onResizeDelta(dx, side);
      }
    };

    const onUp = () => {
      document.body.classList.remove("is-column-resizing");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    document.body.classList.add("is-column-resizing");
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      className={`col-resize-handle col-resize-handle-${side}`}
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      title={label}
      onPointerDown={onPointerDown}
    />
  );
}
