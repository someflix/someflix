export function formatDate(timestamp: number, category: string): string {
  const now = Date.now();
  const eventTime = new Date(timestamp);
  const timeDiff = now - timestamp;

  // For football events
  if (category.toLowerCase() === 'football') {
    if (timestamp === 0) return 'Live';
    if (timeDiff > 0 && timeDiff <= 2 * 60 * 60 * 1000) {
      const minutes = Math.floor(timeDiff / 60000);
      return `${minutes}'`;
    }
  }

  // For other sports (assuming 2 hours for tennis, 3 hours for others)
  const sportDuration = category.toLowerCase() === 'tennis' ? 2 * 60 * 60 * 1000 : 3 * 60 * 60 * 1000;
  if (timeDiff > -30 * 60 * 1000 && timeDiff <= sportDuration) {
    if (timeDiff < 0) return 'Starting soon';
    const minutes = Math.floor(timeDiff / 60000);
    return `${minutes}'`;
  }

  // For future events
  if (timestamp > now) {
    const isToday = eventTime.toDateString() === new Date().toDateString();
    if (isToday) {
      return eventTime.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } else {
      return eventTime.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  }

  // For past events
  return 'Ended';
}

