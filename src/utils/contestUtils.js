export function parseDuration(duration) {
  if (!duration || typeof duration !== 'string') return 0;
  const [days = '0', hours = '0', minutes = '0', seconds = '0'] = duration.split(':').map(Number);
  return (days * 24 * 3600) + (hours * 3600) + (minutes * 60) + seconds;
}

export function formatDurationToText(duration) {
  if (!duration || typeof duration !== 'string') return 'Unknown duration';
  const [days = '0', hours = '0', minutes = '0', seconds = '0'] = duration.split(':').map(Number);
  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
  return parts.length > 0 ? parts.join(' ') : 'No duration';
}

export function parseSubmission(submission) {
  if (!submission || typeof submission !== 'string') {
    return { isSolved: false, minutes: 0, incorrect: 0 };
  }

  // Match "HH:MM:SS\n(-N)" for solved with incorrect submissions
  const solvedWithIncorrectMatch = submission.match(/^(\d{1,2}:\d{2}:\d{2})\n\(-(\d+)\)$/);
  if (solvedWithIncorrectMatch) {
    const time = solvedWithIncorrectMatch[1];
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + seconds / 60;
    const incorrect = parseInt(solvedWithIncorrectMatch[2]);
    return { isSolved: true, minutes: totalMinutes, incorrect };
  }

  // Match HH:MM:SS for solved without incorrect submissions
  const solvedMatch = submission.match(/^(\d{1,2}:\d{2}:\d{2})$/);
  if (solvedMatch) {
    const time = solvedMatch[1];
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + seconds / 60;
    return { isSolved: true, minutes: totalMinutes, incorrect: 0 };
  }

  // Match (-N) for unsolved with incorrect submissions
  const incorrectMatch = submission.match(/^\(-(\d+)\)$/);
  if (incorrectMatch) {
    return { isSolved: false, minutes: 0, incorrect: parseInt(incorrectMatch[1]) };
  }

  return { isSolved: false, minutes: 0, incorrect: 0 };
}