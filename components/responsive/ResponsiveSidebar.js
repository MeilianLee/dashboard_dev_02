import React, { useState, useEffect } from "react";
import { TimeIntervalSelector } from "@components/TimeIntervalSelector";
import { VariableSelector } from "@components/VariableSelector";
import { AdminLevelSelector } from "@components/AdminLevelSelector";

// Responsive sidebar component that collapses to a button on mobile
export const ResponsiveSidebar = ({
  options,
  updateOption,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  isMobile = false
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarTextVisible, setSidebarTextVisible] = useState(!isMobile);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
        setSidebarTextVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  // Handle sidebar visibility
  useEffect(() => {
    if (!sidebarOpen) {
      setSidebarTextVisible(false);
    } else {
      // Delay showing content until animation completes
      setTimeout(() => setSidebarTextVisible(true), 300);
    }
  }, [sidebarOpen]);

  return (
    <div
      className={`sidebar ${sidebarOpen ? "open" : "collapsed"} transition-all duration-300`}
    >
      {/* <button
        className="toggle-btn flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? "❮" : "❯"}
      </button> */}

      <button
          className="toggle-btn p-2 focus:outline-none transition-all duration-300"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
          {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg> */}
          {sidebarOpen ? "❮" : "❯"}
      </button>

      <div
        className={`sidebar-content ${
          sidebarTextVisible ? "visible" : "hidden"
        } transition-opacity duration-200`}
      >
        <TimeIntervalSelector
          label="Date:"
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          options={options}
          updateOption={updateOption}
        />

        <AdminLevelSelector
          label="Administrative Level:"
          options={options}
          updateOption={updateOption}
        />

        <VariableSelector
          selectedVar={options.varType}
          updateOption={updateOption}
        />
      </div>
    </div>
  );
};

export default ResponsiveSidebar;