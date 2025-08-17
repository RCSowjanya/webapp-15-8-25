// Date utility functions for dashboard components

// Common date calculation utility
export const getDateRange = (dateRange, customDateRange = null) => {
  let startDate, endDate;
  
  if (dateRange === "Custom Range" && customDateRange) {
    startDate = customDateRange.startDate;
    endDate = customDateRange.endDate;
  } else {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    
    switch (dateRange) {
      case "Last 7 Days":
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        startDate = sevenDaysAgo.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
        break;
      case "Last 30 Days":
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        startDate = thirtyDaysAgo.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
        break;
      case "Last 3 Months":
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        startDate = threeMonthsAgo.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
        break;
      case "Last 6 Months":
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        startDate = sixMonthsAgo.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
        break;
      case "Last Year":
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        startDate = oneYearAgo.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
        break;
      default:
        return { startDate: null, endDate: null };
    }
  }
  
  return { startDate, endDate };
};

// Format date for display
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format date range for display
export const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return `${start} - ${end}`;
};

// Get relative date description
export const getRelativeDateDescription = (dateRange) => {
  switch (dateRange) {
    case "Last 7 Days":
      return "Last 7 Days";
    case "Last 30 Days":
      return "Last 30 Days";
    case "Last 3 Months":
      return "Last 3 Months";
    case "Last 6 Months":
      return "Last 6 Months";
    case "Last Year":
      return "Last Year";
    case "Custom Range":
      return "Custom Range";
    default:
      return dateRange;
  }
};