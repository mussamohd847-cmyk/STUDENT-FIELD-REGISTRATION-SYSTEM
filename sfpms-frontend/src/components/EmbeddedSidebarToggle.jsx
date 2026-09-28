import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSidebar } from "./useSidebar";

function EmbeddedSidebarToggle({ placement, targetSelector }) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const findTarget = () => setTarget(document.querySelector(targetSelector));
    findTarget();

    const observer = new MutationObserver(findTarget);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [targetSelector]);

  if (!target) return null;

  const isCloseControl = placement === "mobile-close";
  const label = isCloseControl ? "Close sidebar" : isSidebarOpen ? "Hide sidebar" : "Show sidebar";

  return createPortal(
    <button
      type="button"
      className={`sfpms-embedded-toggle sfpms-embedded-toggle--${placement}`}
      onClick={toggleSidebar}
      aria-label={label}
      aria-expanded={isSidebarOpen}
      title={label}
    >
      <span />
      <span />
      <span />
    </button>,
    target
  );
}

export default EmbeddedSidebarToggle;
