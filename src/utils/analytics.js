export const AnalyticsUtils = {
  calculateCGPA(records) {
    if (!records || !records.length) return "0.00";
    const sum = records.reduce((acc, curr) => acc + curr.gpa, 0);
    return (sum / records.length).toFixed(2);
  },

  getAttendanceColor(percentage) {
    if (percentage >= 85) return 'var(--p-success)';
    if (percentage >= 75) return 'var(--p-warning)';
    return 'var(--p-error)';
  }
};

export const CalendarService = {
  // Calendar data is now managed in the store (provided by Admin)
  getDefaultEvents() {
    return [];
  }
};
