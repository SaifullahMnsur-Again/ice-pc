import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import moment from 'moment-timezone';
import Papa from 'papaparse';
import { fetchWithRetry } from '../utils/fetchUtils';
import { formatDurationToText } from '../utils/contestUtils';
import { FaTrophy, FaCalendar, FaClock, FaUsers, FaLock } from 'react-icons/fa6';

const CONTEST_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSXSB-zO1tuSWPCZEgENWdwJJezIyqmlksdwAulBsawNFVekKYlGn6dS0imxMq5qRNjHtB8MUWF0QLX/pub?gid=1861808501&single=true&output=csv';

export default function Home() {
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchContests() {
      try {
        const response = await fetchWithRetry(CONTEST_CSV_URL);
        const csv = await response.text();
        const parsed = Papa.parse(csv.trim(), {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
        });
        if (parsed.errors.length > 0) throw new Error(`CSV parsing error: ${parsed.errors[0].message}`);
        const now = moment.tz('Asia/Dhaka');
        const contests = parsed.data
          .map(row => ({
            id: row.id || '',
            name: row.name || 'Unknown Contest',
            date: row.date || '',
            duration: row.duration || '00:00:00',
            description: row.description || 'No description available.',
            link: row.link || '',
            password: row.password || '',
            problem_setters: row.problem_setters || 'N/A',
          }))
          .filter(contest => moment.tz(contest.date, 'Asia/Dhaka').isAfter(now))
          .sort((a, b) => moment.tz(a.date, 'Asia/Dhaka').diff(moment.tz(b.date, 'Asia/Dhaka')));
        setUpcomingContests(contests);
      } catch (err) {
        setError('Failed to load contests');
        console.error('Error fetching contests:', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchContests();
  }, []);

  useEffect(() => {
    if (upcomingContests.length === 0 || error) return;

    const contest = upcomingContests[0];
    const startDate = moment.tz(contest.date, 'Asia/Dhaka');
    const updateCountdown = () => {
      const now = moment.tz('Asia/Dhaka');
      const diff = startDate.diff(now);
      if (diff <= 0) {
        setCountdown(
          <p className="text-gray-200 text-xl font-semibold text-center font-['Inter']">
            Contest is running!
          </p>
        );
        return;
      }

      const duration = moment.duration(diff);
      setCountdown(
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center justify-center">
          <div className="bg-gray-800/20 p-3 rounded-lg">
            <span className="text-3xl font-bold text-indigo-600">{Math.floor(duration.asDays())}</span>
            <p className="text-xs text-gray-400 text-center font-['Inter']">Days</p>
          </div>
          <div className="bg-gray-800/20 p-3 rounded-lg">
            <span className="text-3xl font-bold text-indigo-600">{duration.hours().toString().padStart(2, '0')}</span>
            <p className="text-xs text-gray-400 text-center font-['Inter']">Hours</p>
          </div>
          <div className="bg-gray-800/20 p-3 rounded-lg">
            <span className="text-3xl font-bold text-indigo-600">{duration.minutes().toString().padStart(2, '0')}</span>
            <p className="text-xs text-gray-400 text-center font-['Inter']">Minutes</p>
          </div>
          <div className="bg-gray-800/20 p-3 rounded-lg">
            <span className="text-3xl font-bold text-indigo-600">{duration.seconds().toString().padStart(2, '0')}</span>
            <p className="text-xs text-gray-400 text-center font-['Inter']">Seconds</p>
          </div>
        </div>
      );
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [upcomingContests, error]);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gray-900 flex flex-col"
      >
        <main className="max-w-7xl mx-auto px-4 pt-20 pb-12 flex-grow">
          <p className="text-red-400 text-2xl font-bold text-center font-['Inter']">{error}</p>
        </main>
      </motion.div>
    );
  }

  const firstUpcomingContest = upcomingContests[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-900 flex flex-col"
    >
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-12 flex-grow">
        <section className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-indigo-400">
            Welcome to ICE Programming Club
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Join our weekly competitive programming contests and sharpen your coding skills with the ICE PC community at the University of Rajshahi.
          </p>
        </section>
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-indigo-400">
            Upcoming Contest
          </h2>
          {isLoading ? (
            <p className="text-lg text-gray-300 text-center font-['Inter']">
              Checking for upcoming contests...
            </p>
          ) : firstUpcomingContest ? (
            <div className="max-w-lg mx-auto bg-gradient-to-br from-gray-800/90 to-gray-900/30 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-gray-700/70 group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <h3 className="text-xl text-indigo-300 mb-3 flex items-center gap-2 group-hover:text-indigo-200 transition-colors">
                <FaTrophy className="text-indigo-400 group-hover:text-indigo-300" />
                <Link to={`/contests?id=${firstUpcomingContest.id}`} className="hover:text-indigo-100 transition-colors">
                  {firstUpcomingContest.name}
                </Link>
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-200 flex items-center gap-2 group-hover:text-gray-100 transition-colors">
                  <FaCalendar className="text-indigo-400 group-hover:text-indigo-300" />
                  {moment.tz(firstUpcomingContest.date, 'Asia/Dhaka').format('MMMM D, YYYY, h:mm A')}
                </p>
                <p className="text-sm text-gray-200 flex items-center gap-2 group-hover:text-gray-100 transition-colors">
                  <FaClock className="text-indigo-400 group-hover:text-indigo-300" />
                  Duration: {formatDurationToText(firstUpcomingContest.duration)}
                </p>
                <p className="text-sm text-gray-200 flex items-center gap-2 group-hover:text-gray-100 transition-colors">
                  <FaUsers className="text-indigo-400 group-hover:text-indigo-300" />
                  Problem Setter(s): <span className="font-medium">{firstUpcomingContest.problem_setters}</span>
                </p>
                <p className="text-sm text-gray-200 flex items-center gap-2 group-hover:text-gray-100 transition-colors">
                  <FaLock className="text-indigo-400 group-hover:text-indigo-300" />
                  Password: <span className="font-medium text-indigo-300">{firstUpcomingContest.password || 'none'}</span>
                </p>
              </div>
              <div className="mb-4 mt-4">{countdown}</div>
              <div className="text-center">
                <Link
                  to={`/contests?id=${firstUpcomingContest.id}`}
                  className="inline-block px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:scale-105 transition-all duration-200 text-xs font-semibold font-['Inter']"
                >
                  View Contest
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-lg text-gray-300 text-center font-['Inter']">
              No contests scheduled.
            </p>
          )}
        </section>
        <section className="mb-12 text-center">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/coders"
              className="text-lg px-6 py-2 rounded-lg bg-gradient-to-br from-indigo-700 to-purple-600 text-white hover:bg-indigo-600 hover:scale-105 transition-all duration-200 font-['Inter']"
            >
              See All Coders
            </Link>
            <Link
              to="/contests"
              className="text-lg px-6 py-2 rounded-lg bg-gradient-to-br from-indigo-700 to-purple-600 text-white hover:bg-indigo-600 hover:scale-105 transition-all duration-200 font-['Inter']"
            >
              See All Contests
            </Link>
          </div>
        </section>
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6 text-center text-indigo-400">
            About ICE PC
          </h2>
          <div className="p-8 bg-gray-800/30 rounded-lg shadow-xl">
            <p className="text-lg text-gray-300 mb-4 font-['Inter']">
              The ICE Programming Club (ICE PC) is a vibrant community within the Department of Information and Communication Engineering at the University of Rajshahi. Established to foster a passion for competitive programming, ICE PC organizes weekly contests, workshops, and training sessions to help students excel in coding and problem-solving skills.
            </p>
            <p className="text-lg text-gray-300 mb-4 font-['Inter']">
              Our mission is to create a collaborative environment where coders can learn, compete, and grow. Whether you're a beginner or an experienced programmer, ICE PC welcomes you to join our journey towards mastering algorithms and data structures.
            </p>
            <p className="text-lg text-gray-300 font-['Inter']">
              Connect with us on social media to stay updated on upcoming events and opportunities!
            </p>
          </div>
        </section>
      </main>
    </motion.div>
  );
}