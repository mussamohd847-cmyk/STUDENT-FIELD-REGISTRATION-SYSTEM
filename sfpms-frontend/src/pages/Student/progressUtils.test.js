import { describe, it, expect } from 'vitest';
import { calculateStudentProgress } from './progressUtils';

describe('calculateStudentProgress', () => {
  it('reflects a real application and attendance status', () => {
    const progress = calculateStudentProgress({
      applicationSubmitted: true,
      organization: 'E-GAZ',
      supervisor: 'Mr. Musa',
      logEntries: [
        { date: '2026-09-10' },
        { date: '2026-09-11' },
        { date: '2026-09-12' },
      ],
    });

    expect(progress.applicationStatus).toBe('Submitted');
    expect(progress.organizationStatus).toBe('E-GAZ');
    expect(progress.attendanceCount).toBe(3);
    expect(progress.progressPercent).toBeGreaterThan(0);
  });
});



