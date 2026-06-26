import { clsx } from 'clsx';

interface DailyLogStatusChipProps {
  lastLogDate: string | null;
  className?: string;
}

export function DailyLogStatusChip({ lastLogDate, className }: DailyLogStatusChipProps) {
  // Use IST timezone for comparison
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const now = new Date();
  const istNow = new Date(now.getTime() + istOffset);
  const today = istNow.toISOString().split('T')[0];

  if (!lastLogDate) {
    return (
      <span
        className={clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800',
          className
        )}
        role="status"
        aria-label="Daily log pending"
      >
        ⚠ Log pending
      </span>
    );
  }

  const logDate = new Date(lastLogDate);
  const istLogDate = new Date(logDate.getTime() + istOffset);
  const logDateStr = istLogDate.toISOString().split('T')[0];

  if (logDateStr === today) {
    const timeStr = istLogDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return (
      <span
        className={clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800',
          className
        )}
        role="status"
        aria-label={`Daily log completed at ${timeStr}`}
      >
        ✓ Logged {timeStr}
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800',
        className
      )}
      role="status"
      aria-label={`Daily log pending - last logged ${logDateStr}`}
    >
      ⚠ Log pending
    </span>
  );
}
