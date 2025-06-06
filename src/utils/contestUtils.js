export function parseDuration(duration) {
  if (!duration || typeof duration !== 'string') return 0;
  const match = duration.match(/^(\d+):(\d{2}):(\d{2})$/);
  if (!match) {
    console.error(`Invalid duration format: ${duration}`);
    return 0;
  }
  const days = parseInt(match[1], 10);
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);
  return (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60);
}

export function formatDurationToText(duration) {
  if (!duration || typeof duration !== 'string') return 'Unknown';
  const match = duration.match(/^(\d+):(\d{2}):(\d{2})$/);
  if (!match) return 'Invalid';
  const days = parseInt(match[1], 10);
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);
  return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

// Placeholder for parseSubmission (adjust as needed)
export function parseSubmission(submission) {
  if (!submission || typeof submission !== 'string') {
    return { isSolved: false, minutes: 0, incorrect: 0, seconds: 0 };
  }
  const match = submission.match(/(\d+):(\d{2})\+(\d+)/);
  if (match) {
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const incorrect = parseInt(match[3], 10);
    return {
      isSolved: true,
      minutes: minutes + Math.floor(seconds / 60),
      incorrect,
      seconds: minutes * 60 + seconds,
    };
  }
  const incorrectMatch = submission.match(/\+(\d+)/);
  if (incorrectMatch) {
    return { isSolved: false, minutes: 0, incorrect: parseInt(incorrectMatch[1], 10), seconds: 0 };
  }
  return { isSolved: false, minutes: 0, incorrect: 0, seconds: 0 };
}