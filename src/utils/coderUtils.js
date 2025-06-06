export function getCodeforcesRank(rating) {
  const parsedRating = parseInt(rating);
  if (isNaN(parsedRating)) return '';
  if (parsedRating >= 3000) return 'legendary-grandmaster';
  if (parsedRating >= 2600) return 'international-grandmaster';
  if (parsedRating >= 2400) return 'grandmaster';
  if (parsedRating >= 2300) return 'international-master';
  if (parsedRating >= 2100) return 'master';
  if (parsedRating >= 1900) return 'candidate-master';
  if (parsedRating >= 1600) return 'expert';
  if (parsedRating >= 1400) return 'specialist';
  if (parsedRating >= 1200) return 'pupil';
  return 'newbie';
}

export function handleLink(handle, platform) {
  if (!handle || handle.trim() === '') {
    return { url: '', display: '-' };
  }
  const trimmedHandle = handle.trim();
  let url = '';
  switch (platform.toLowerCase()) {
    case 'codeforces':
      url = `https://codeforces.com/profile/${trimmedHandle}`;
      break;
    case 'vjudge':
      url = `https://vjudge.net/user/${trimmedHandle}`;
      break;
    case 'atcoder':
      url = `https://atcoder.jp/users/${trimmedHandle}`;
      break;
    case 'codechef':
      url = `https://www.codechef.com/users/${trimmedHandle}`;
      break;
    default:
      url = '';
  }
  return { url, display: trimmedHandle };
}

export function getYearPrefix(studentId) {
  if (!studentId || typeof studentId !== 'string') return '';
  const match = studentId.match(/^\d{2}/);
  return match ? `20${match[0]}` : '';
}