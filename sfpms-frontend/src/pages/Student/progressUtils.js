export function calculateStudentProgress({
  applicationSubmitted = false,
  organization = '',
  supervisor = '',
  logEntries = [],
  attendanceCount = 0,
}) {
  const hasApplication = Boolean(applicationSubmitted);
  const hasOrganization = Boolean(organization && organization !== 'Not assigned');
  const hasSupervisor = Boolean(supervisor && supervisor !== 'Not assigned');
  const logCount = Array.isArray(logEntries) ? logEntries.length : Number(attendanceCount) || 0;

  const applicationStatus = hasApplication ? 'Submitted' : 'Not Submitted';
  const organizationStatus = hasOrganization ? organization : 'Pending';
  const attendanceCountValue = logCount || Number(attendanceCount) || 0;

  const progressItems = [
    hasApplication ? 1 : 0,
    hasOrganization ? 1 : 0,
    hasSupervisor ? 1 : 0,
    attendanceCountValue > 0 ? 1 : 0,
  ];

  const progressPercent = Math.round(
    (progressItems.reduce((sum, value) => sum + value, 0) / progressItems.length) * 100
  );

  return {
    applicationStatus,
    organizationStatus,
    attendanceCount: attendanceCountValue,
    supervisorStatus: hasSupervisor ? supervisor : 'Not assigned',
    progressPercent,
  };
}



