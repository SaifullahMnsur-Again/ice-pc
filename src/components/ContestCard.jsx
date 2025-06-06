import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment-timezone';
import { parseDuration, formatDurationToText } from '../utils/contestUtils';
import { FaTrophy, FaCalendar, FaClock, FaUsers, FaLock, FaInfoCircle } from 'react-icons/fa';

function ContestCard({ contest }) {
  const [status, setStatus] = useState('upcoming');
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const startDate = moment.tz(contest.date, 'Asia/Dhaka');
    const durationSeconds = parseDuration(contest.duration);
    const endDate = moment(startDate).add(durationSeconds, 'seconds');
    const now = moment.tz('Asia/Dhaka');

    let newStatus = 'upcoming';
    if (now.isAfter(endDate)) newStatus = contest.rank_sheet ? 'ended' : 'waiting';
    else if (now.isAfter(startDate)) newStatus = 'running';
    setStatus(newStatus);

    if (newStatus === 'upcoming') {
      const updateCountdown = () => {
        const nowTime = moment.tz('Asia/Dhaka');
        const diff = startDate.diff(nowTime);
        if (diff <= 0) {
          setStatus('running');
          setCountdown(<p className="text-gray-200 text-xl font-semibold font-['Inter']">Contest is running!</p>);
          return;
        }
        const duration = moment.duration(diff);
        setCountdown(
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <span className="text-3xl font-bold text-indigo-400">{Math.floor(duration.asDays())}</span>
              <p className="text-xs text-gray-300 font-['Inter']">Days</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <span className="text-3xl font-bold text-indigo-400">{duration.hours().toString().padStart(2, '0')}</span>
              <p className="text-xs text-gray-300 font-['Inter']">Hours</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <span className="text-3xl font-bold text-indigo-400">{duration.minutes().toString().padStart(2, '0')}</span>
              <p className="text-xs text-gray-300 font-['Inter']">Minutes</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <span className="text-3xl font-bold text-indigo-400">{duration.seconds().toString().padStart(2, '0')}</span>
              <p className="text-xs text-gray-300 font-['Inter']">Seconds</p>
            </div>
          </div>
        );
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    } else if (newStatus === 'running') {
      setCountdown(<p className="text-gray-200 text-xl font-semibold font-['Inter']">Contest is running!</p>);
    } else if (newStatus === 'waiting') {
      setCountdown(<p className="text-gray-200 text-xl font-semibold font-['Inter']">Contest has finished. Waiting for rank sheet.</p>);
    } else if (newStatus === 'ended' && contest.rank_sheet) {
      setCountdown(<p className="text-gray-200 text-xl font-semibold font-['Inter']">Rank sheet available!</p>);
    }
  }, [contest]);

  return (
    <Link
      to={`/contests?id=${contest.id}`} // Relative path
      className="block bg-gradient-to-br from-gray-800/90 to-gray-900/30 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-gray-700/70 group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 max-w-2xl mx-auto"
    >
      <h3 className="text-2xl font-bold font-['Inter'] text-indigo-300 mb-4 flex items-center gap-2 group-hover:text-indigo-200 transition-colors">
        <FaTrophy className="text-indigo-400 group-hover:text-indigo-300" />
        {contest.name}
      </h3>
      <div className="space-y-3">
        <p className="text-sm text-gray-200 font-['Inter'] flex items-center gap-2 group-hover:text-gray-100 transition-colors">
          <FaCalendar className="text-indigo-400 group-hover:text-indigo-300" />
          {moment.tz(contest.date, 'Asia/Dhaka').format('MMMM D, YYYY, h:mm A')}
        </p>
        <p className="text-sm text-gray-200 font-['Inter'] flex items-center gap-2 group-hover:text-gray-100 transition-colors">
          <FaClock className="text-indigo-400 group-hover:text-indigo-300" />
          Duration: {formatDurationToText(contest.duration)}
        </p>
        <p className="text-sm text-gray-200 font-['Inter'] flex items-center gap-2 group-hover:text-gray-100 transition-colors">
          <FaUsers className="text-indigo-400 group-hover:text-indigo-300" />
          Problem Setter(s): <span className="font-medium">{contest.problem_setters}</span>
        </p>
        <p className="text-sm text-gray-200 font-['Inter'] flex items-center gap-2 group-hover:text-gray-100 transition-colors">
          <FaLock className="text-indigo-400 group-hover:text-indigo-300" />
          Password: <span className="font-medium text-indigo-300">{contest.password || 'None'}</span>
        </p>
        <p className="text-sm text-gray-200 font-['Inter'] flex items-center gap-2 group-hover:text-gray-100 transition-colors line-clamp-2">
          <FaInfoCircle className="text-indigo-400 group-hover:text-indigo-300" />
          {contest.description}
        </p>
      </div>
      <p className="text-gray-200 text-lg font-semibold font-['Inter'] mt-4 mb-4">
        {status === 'waiting'
          ? 'Waiting for Rank'
          : status === 'ended'
          ? contest.rank_sheet
            ? 'Rank Available'
            : 'Finished'
          : status.charAt(0).toUpperCase() + status.slice(1)}
      </p>
      <div className="mt-4">{countdown}</div>
    </Link>
  );
}

export default ContestCard;