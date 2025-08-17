"use client";
import React, { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../Models/Sidebar";
import Header from "../Models/Header";

import ActivityLog from "../View/dashboard/ActivityLog";
// import TodaysStatisticsAvailability from "../View/dashboard/TodaysStatisticsAvailability";

const TimelineContext = createContext();

export function TimelineProvider({ children }) {
  const [selectedDateRange, setSelectedDateRange] = useState("Last 30 Days");
  const [customDateRange, setCustomDateRange] = useState(null);

  return (
    <TimelineContext.Provider
      value={{
        selectedDateRange,
        setSelectedDateRange,
        customDateRange,
        setCustomDateRange,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline() {
  return useContext(TimelineContext);
}

const ClientLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pathname = usePathname();
  const isLiveFeedPage = pathname === "/livefeed";
  
  // Move useTimeline hook to the top level
  const { selectedDateRange, customDateRange } = useTimeline();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getRightSidebar = () => {
    return (
      <ActivityLog
        dateRange={selectedDateRange}
        customDateRange={customDateRange}
      />
    );
  };

  // Special layout for livefeed page
  if (isLiveFeedPage) {
    return (
      <div className="flex h-screen w-screen overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden min-h-0">
          {/* Header */}
          <Header onMenuClick={toggleSidebar} />

          {/* Body with responsive layout */}
          <div className="flex-1 h-full min-h-0 overflow-hidden bg-[#F4F3EF]">
            {/* Desktop Layout (above 1000px) */}
            <div className="hidden xl:flex h-full">
              {/* Main Content */}
              <div className="flex-1 p-3 min-h-0 overflow-auto">
                <div className="bg-white shadow-lg rounded-lg border border-gray-200 h-full w-full flex flex-col min-h-0">
                  <div className="flex-1 min-h-0 overflow-auto">{children}</div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="w-80 border-l border-gray-200  overflow-y-auto">
                {getRightSidebar()}
              </div>
            </div>

            {/* Mobile/Tablet Layout (below 1000px) */}
            <div className="xl:hidden h-full overflow-auto">
              {/* Main Content */}
              <div className="p-3">
                <div className="bg-white shadow-lg rounded-lg border border-gray-200 w-full">
                  {children}
                </div>
              </div>

              {/* Right Sidebar - Below content on smaller screens */}
              <div className="border-t border-gray-200 bg-white shadow-lg">
                {getRightSidebar()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default layout for other pages (no ActivityLog)
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden min-h-0">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />

        {/* Body */}
        <div className="flex-1 h-full min-h-0 overflow-auto p-3">
          <div className="bg-white shadow-lg rounded-lg border border-gray-200 h-full w-full flex flex-col min-h-0">
            <div className="flex-1 min-h-0 overflow-auto">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLayout;