import { useEffect, useState } from "react";
import { SidebarContext } from "./sidebar-context";

const mobileNavigationQuery = "(max-width: 1024px)";

export function SidebarProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.matchMedia(mobileNavigationQuery).matches ? false : true;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(mobileNavigationQuery);
    const handleViewportChange = ({ matches }) => {
      setIsSidebarOpen(!matches);
    };

    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((isOpen) => !isOpen);
  };

  useEffect(() => {
    document.body.classList.toggle("sfpms-sidebar-open", isSidebarOpen);
    document.body.classList.toggle("sfpms-sidebar-collapsed", !isSidebarOpen);

    return () => {
      document.body.classList.remove("sfpms-sidebar-open", "sfpms-sidebar-collapsed");
    };
  }, [isSidebarOpen]);

  // Role dashboards have their own sidebar components, but they all live in
  // the shared layout.  Closing the drawer after selecting a destination keeps
  // the mobile experience consistent without changing any role navigation.
  useEffect(() => {
    const closeAfterNavigation = (event) => {
      if (!window.matchMedia(mobileNavigationQuery).matches || !isSidebarOpen) {
        return;
      }

      const link = event.target.closest("a");
      const sidebar = event.target.closest(
        ".sfpms-sidebar, .sidebar, .admin-sidebar, .supervisor-sidebar"
      );

      if (link && sidebar) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("click", closeAfterNavigation);
    return () => document.removeEventListener("click", closeAfterNavigation);
  }, [isSidebarOpen]);

  return (
    <SidebarContext.Provider
      value={{ isSidebarOpen, toggleSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
}



