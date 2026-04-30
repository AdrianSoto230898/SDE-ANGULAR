// core/utils/time-utils.ts
export function formatTimestamp(
    ts?: number | string | Date,
    mode: '12' | '24' = '24'
  ): string {
    const d = ts ? new Date(ts) : new Date();
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: mode === '12'
    });
  }
  