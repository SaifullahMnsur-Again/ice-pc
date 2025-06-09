// ice-pc\src\utils\contestUtils.js

/**
 * Converts a duration string (e.g., "01:30:00") into total seconds.
 * @param {string} durationString The duration string in "HH:MM:SS" or "MM:SS" format.
 * @returns {number} Total duration in seconds.
 */
export function parseDuration(durationString) {
  if (!durationString || typeof durationString !== 'string') {
    return 0;
  }
  const parts = durationString.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) { // Handle MM:SS format too
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

/**
 * Formats total seconds into a human-readable duration string (e.g., "1h 30m 5s").
 * @param {string} durationString The duration string to parse and format.
 * @returns {string} Formatted duration text.
 */
export function formatDurationToText(durationString) {
  const totalSeconds = parseDuration(durationString);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let parts = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || (hours > 0 && seconds > 0)) { // Include minutes if there are hours or if it's just minutes and seconds
    parts.push(`${minutes}m`);
  }
  if (seconds > 0 || parts.length === 0) { // Always include seconds if no other parts or if it's just seconds
    parts.push(`${seconds}s`);
  }

  return parts.join(' ');
}


/**
 * Parses a problem submission string to extract submission details.
 * It determines if the problem was solved, the time taken (in seconds),
 * and the number of incorrect attempts.
 *
 * @param {string} submission The submission string (e.g., "1:16:01 (-1)", "1:16:01", "(-1)").
 * @returns {{isSolved: boolean, incorrect: number, seconds: number}}
 * - isSolved: true if the problem was accepted, false otherwise.
 * - incorrect: The number of incorrect submissions (including those before acceptance or for unsolved problems).
 * - seconds: The time of acceptance in total seconds. 0 if not solved.
 */
export function parseSubmission(submission) {
  if (!submission || typeof submission !== 'string') {
    // Default for empty or invalid input: not solved, no incorrect attempts.
    return { isSolved: false, incorrect: 0, seconds: 0 };
  }

  // Case 1: Solved with incorrect attempts (e.g., "1:16:01 (-1)")
  const solvedWithIncorrectMatch = submission.match(/^(\d+):(\d{2}):(\d{2})\s+\(-(\d+)\)$/);
  if (solvedWithIncorrectMatch) {
    const hoursPart = parseInt(solvedWithIncorrectMatch[1], 10);
    const minutesPart = parseInt(solvedWithIncorrectMatch[2], 10);
    const secondsPart = parseInt(solvedWithIncorrectMatch[3], 10);
    const incorrectCount = parseInt(solvedWithIncorrectMatch[4], 10);
    const totalSeconds = hoursPart * 3600 + minutesPart * 60 + secondsPart;
    return {
      isSolved: true,
      incorrect: incorrectCount,
      seconds: totalSeconds, // Total seconds solved
    };
  }

  // Case 2: Solved with 0 incorrect attempts (e.g., "1:16:01")
  const solvedNoIncorrectMatch = submission.match(/^(\d+):(\d{2}):(\d{2})$/);
  if (solvedNoIncorrectMatch) {
    const hoursPart = parseInt(solvedNoIncorrectMatch[1], 10);
    const minutesPart = parseInt(solvedNoIncorrectMatch[2], 10);
    const secondsPart = parseInt(solvedNoIncorrectMatch[3], 10);
    const totalSeconds = hoursPart * 3600 + minutesPart * 60 + secondsPart;
    return {
      isSolved: true,
      incorrect: 0, // Explicitly zero incorrect attempts
      seconds: totalSeconds,
    };
  }

  // Case 3: Incorrect attempts only (e.g., "(-1)")
  // This implies the problem was attempted but not solved.
  const incorrectOnlyMatch = submission.match(/^\s*\(-(\d+)\)\s*$/); // Allows leading/trailing spaces
  if (incorrectOnlyMatch) {
    const incorrectCount = parseInt(incorrectOnlyMatch[1], 10);
    return { isSolved: false, incorrect: incorrectCount, seconds: 0 };
  }
  
  // Case 4: Not attempted / No submissions or unrecognized format
  // This handles empty strings, "-", "0", or any other content that doesn't match above patterns
  return { isSolved: false, incorrect: 0, seconds: 0 };
}

export function parseProblemName(problemHead) {
  console.log(`Problem name: ${problemHead}`);
  
  return problemHead.split(' ');
}

export function formatSubmissionData(submission) {
  console.log(`Submission: ${submission}`);
  
  if (!submission) {
    return ['', ''];
  }

  let time = '';
  let wrong = '';

  if (submission.includes('\n')) {
    [time, wrong] = submission.split('\n');
  } else if (submission.includes(':')) {
    time = submission;
  } else if (submission.startsWith('(')) {
    wrong = submission;
  }

  // Extract wrong number (can be negative)
  let wrongNumber = null;
  if (wrong) {
    const match = wrong.match(/\((-?\d+)\)/);
    if (match) {
      wrongNumber = parseInt(match[1], 10);
    }
  }

  // Process time with ceiling minutes
  let timeDisplay = '';
  if (time) {
    const [hh, mm, ss] = time.split(':').map(Number);
    let minutes = mm;
    if (ss > 0) {
      minutes = mm + 1;
      if (minutes === 60) {
        minutes = 0;
        const hours = (hh + 1) % 24;
        timeDisplay = `${hours.toString().padStart(2, '0')}:00`;
      } else {
        timeDisplay = `${hh.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    } else {
      timeDisplay = `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
    }
  }

  // For accepted solution (has time)
  if (time) {
    if (wrongNumber !== null) {
      console.log(`Wrong number is not null and is positive`);
      return [`+${Math.abs(wrongNumber)}`, timeDisplay];
    } else {
      console.log(`Wrong is null or is not positive`);
      return ['+', timeDisplay];
    }
  }

  // For not accepted (no time, negative wrong only)
  if (wrongNumber !== null && wrongNumber < 0) {
    console.log(`not accepted!`);
    return [wrongNumber.toString(), ''];
  }

  // Otherwise empty
  return ['', ''];
}