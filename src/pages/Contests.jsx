import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import moment from 'moment-timezone';
import Papa from 'papaparse';
import { fetchWithRetry } from '../utils/fetchUtils';
import { parseDuration, parseSubmission, formatDurationToText, parseProblemName, formatSubmissionData } from '../utils/contestUtils';
import { FaTrophy, FaCalendar, FaClock, FaUsers, FaLock, FaInfoCircle } from 'react-icons/fa';
import { CONTEST_CSV_URL } from '../constants'; // Imported from new constants file

function Contests() {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [rankData, setRankData] = useState(null);
  const [filteredRankData, setFilteredRankData] = useState([]);
  const [contestStatus, setContestStatus] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [vjudgeToName, setVjudgeToName] = useState({});
  const [error, setError] = useState(null);
  const [isLoadingContests, setIsLoadingContests] = useState(true);
  const [isLoadingRank, setIsLoadingRank] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Fetch contests from CSV
  useEffect(() => {
    async function fetchContests() {
      try {
        setIsLoadingContests(true);
        setError(null);
        console.log('Attempting to fetch contest CSV from:', CONTEST_CSV_URL);
        const response = await fetchWithRetry(CONTEST_CSV_URL);
        const csv = await response.text();
        
        if (!csv.trim()) {
          throw new Error('Contest CSV is empty or contains only whitespace.');
        }
        
        const parsed = Papa.parse(csv.trim(), {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
        });

        if (parsed.errors.length > 0) {
          throw new Error(`CSV parsing error for contests: ${parsed.errors[0].message}`);
        }
        
        const data = parsed.data
          .map(row => ({
            id: row.id || '',
            name: row.name || 'Unknown Contest',
            date: row.date || 'Unknown Date',
            duration: row.duration || '00:00:00',
            description: row.description || 'No description available.',
            rank_sheet: row.rank_sheet || '',
            link: row.link || '#',
            password: row.password || '',
            problem_setters: row.problem_setters || 'N/A',
            coders: row.coders || '',
          }))
          .sort((a, b) => moment.tz(b.date, 'YYYY-MM-DD HH:mm', 'Asia/Dhaka').diff(moment.tz(a.date, 'YYYY-MM-DD HH:mm', 'Asia/Dhaka')));
        
        if (data.length === 0) {
          throw new Error('No contest data found after parsing CSV. Check CSV headers/content.');
        }
        
        setContests(data);
        const id = searchParams.get('id');
        setSelectedContest(id ? data.find(c => c.id === id) : data[0]);
        console.log('Contests fetched successfully:', data);
      } catch (err) {
        setError(`Failed to load contests: ${err.message}`);
        console.error('Detailed Error fetching contests:', err);
      } finally {
        setIsLoadingContests(false);
      }
    }
    fetchContests();
  }, [searchParams]);

  // Update contest status, countdown, and fetch rank data
  useEffect(() => {
    if (!selectedContest) return;

    // Fetch coders for Vjudge-to-Name mapping
    async function fetchCoders() {
      if (!selectedContest.coders) return;
      try {
        console.log('Attempting to fetch coders CSV from:', selectedContest.coders);
        const response = await fetchWithRetry(selectedContest.coders);
        const csv = await response.text();
        
        if (!csv.trim()) {
          console.warn('Coders CSV is empty or contains only whitespace. Skipping name mapping.');
          return;
        }
        
        const parsed = Papa.parse(csv.trim(), {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
        });

        if (parsed.errors.length > 0) {
          throw new Error(`Coders CSV parsing error: ${parsed.errors[0].message}`);
        }
        
        const nameMap = parsed.data.reduce((acc, row) => {
          if (row.Vjudge && row.Name && row.Name.trim() !== '') {
            acc[row.Vjudge] = row.Name;
          }
          return acc;
        }, {});
        setVjudgeToName(nameMap);
        console.log('Coders fetched successfully:', nameMap);
      } catch (err) {
        console.error('Detailed Error fetching coders:', err);
        // Do not set global error for coders, as it's not critical for main functionality
      }
    }
    fetchCoders();

    // Fetch rank data for ranked contests
    async function fetchRankData() {
      try {
        setIsLoadingRank(true);
        setError(null); // Clear previous rank errors
        if (!selectedContest.rank_sheet) {
          console.log('No rank sheet URL provided for this contest.');
          setRankData(null); // Explicitly clear rank data if no sheet is linked
          return;
        }

        console.log('Attempting to fetch rank CSV from:', selectedContest.rank_sheet);
        const response = await fetchWithRetry(selectedContest.rank_sheet);
        const csv = await response.text();
        
        if (!csv.trim()) {
          throw new Error('Rank CSV is empty or contains only whitespace.');
        }
        
        const parsed = Papa.parse(csv.trim(), {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
        });

        if (parsed.errors.length > 0) {
          throw new Error(`CSV parsing error for rank sheet: ${parsed.errors[0].message}`);
        }
        
        const data = parsed.data;
        if (!data || data.length === 0) {
          throw new Error('No valid data rows found in rank CSV.');
        }
        
        const headers = Object.keys(data[0] || {});
        if (headers.length < 4) {
          throw new Error('Insufficient headers in rank CSV. Expected at least "Rank", "Team", "Solved", "Penalty".');
        }

        const problemColumns = headers
          .slice(4)
          .map(col => {
            if (!col || typeof col !== 'string') return '';
            const match = col.match(/([A-Za-z])\s*(\d+)\s*\/\s*(\d+)/);
            return match ? `${match[1]} (${match[2]}/${match[3]})` : col;
          })
          .filter(col => col);

        const firstSolvers = {};
        headers.slice(4).forEach(colName => {
          let earliestTime = Infinity;
          let firstSolverVjudgeHandle = null; // Store vjudgeHandle instead of rowIndex

          data.forEach(row => { // Iterate through all data to find first solver
            const team = row['Team'] || '';
            const vjudgeHandle = team.match(/^([^\(]+)\(/)?.[1]?.trim() || team.trim();
            const submission = row[colName] || '';
            const { isSolved, seconds } = parseSubmission(submission);

            if (isSolved && seconds < earliestTime) {
              earliestTime = seconds;
              firstSolverVjudgeHandle = vjudgeHandle;
            }
          });
          if (firstSolverVjudgeHandle) {
            firstSolvers[colName] = firstSolverVjudgeHandle;
          }
        });
        
        setRankData({ headers, data, problemColumns, firstSolvers });
        setFilteredRankData(data);
        console.log('Rank data fetched and processed successfully.');
      } catch (err) {
        setError(`Failed to load rank data: ${err.message}`);
        console.error('Detailed Error fetching rank sheet:', err);
      } finally {
        setIsLoadingRank(false);
      }
    }

    // Update contest status and countdown every second
    const updateStatusAndCountdown = () => {
      const startDate = moment.tz(selectedContest.date, 'YYYY-MM-DD HH:mm', 'Asia/Dhaka');
      if (!startDate.isValid()) {
        setError(`Invalid contest start time format: ${selectedContest.date}`);
        setCountdown(null);
        setContestStatus('');
        console.error(`Invalid start time: ${selectedContest.date}`);
        return;
      }
      const durationSeconds = parseDuration(selectedContest.duration);
      const endDate = startDate.clone().add(durationSeconds, 'seconds');
      const now = moment.tz('Asia/Dhaka');

      let status = 'upcoming';
      if (now.isAfter(endDate)) {
        status = selectedContest.rank_sheet ? 'ranked' : 'waiting';
      } else if (now.isAfter(startDate)) {
        status = 'running';
      }
      setContestStatus(status);

      if (status === 'upcoming') {
        const diff = startDate.diff(now);
        if (diff <= 0) {
          setContestStatus('running');
          setCountdown(
            <div className="text-center">
              <p className="text-gray-200 text-2xl font-semibold mb-4 font-['Inter']">Contest is running!</p>
              <a
                href={selectedContest.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:scale-105 transition-all duration-300 text-sm font-semibold font-['Inter']"
              >
                View Live Rank
              </a>
            </div>
          );
          return;
        }
        const duration = moment.duration(diff);
        setCountdown(
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center justify-center">
            <div className="bg-gray-800/20 p-3 rounded-lg">
              <span className="text-3xl font-bold text-indigo-600">{Math.floor(duration.asDays())}</span>
              <p className="text-xs text-gray-400 font-['Inter']">Days</p>
            </div>
            <div className="bg-gray-800/20 p-3 rounded-lg">
              <span className="text-3xl font-bold text-indigo-600">{duration.hours().toString().padStart(2, '0')}</span>
              <p className="text-xs text-gray-400 font-['Inter']">Hours</p>
            </div>
            <div className="bg-gray-800/20 p-3 rounded-lg">
              <span className="text-3xl font-bold text-indigo-600">{duration.minutes().toString().padStart(2, '0')}</span>
              <p className="text-xs text-gray-400 font-['Inter']">Minutes</p>
            </div>
            <div className="bg-gray-800/20 p-3 rounded-lg">
              <span className="text-3xl font-bold text-indigo-600">{duration.seconds().toString().padStart(2, '0')}</span>
              <p className="text-xs text-gray-400 font-['Inter']">Seconds</p>
            </div>
          </div>
        );
      } else if (status === 'running') {
        setCountdown(
          <div className="text-center">
            <p className="text-gray-200 text-2xl font-semibold mb-4 font-['Inter']">Contest is running!</p>
            <a
              href={selectedContest.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:scale-105 transition-all duration-300 text-sm font-semibold font-['Inter']"
            >
              View Live Rank
            </a>
          </div>
        );
      } else if (status === 'waiting') {
        setCountdown(
          <p className="text-gray-200 text-2xl font-semibold text-center font-['Inter']">
            Waiting for final ranks to be added.
          </p>
        );
      } else if (status === 'ranked') {
        setCountdown(null);
        // Only attempt to fetch rank data if rankData is not yet loaded and contest status is 'ranked'
        if (!rankData) fetchRankData(); 
      }
    };

    // Run immediately and every 5 seconds for countdown to save resources
    updateStatusAndCountdown();
    const interval = setInterval(updateStatusAndCountdown, 5000); 
    return () => clearInterval(interval);
  }, [selectedContest, rankData]); // Added rankData to dependency array to re-run when it's null (e.g. on contest select)

  const handleContestSelect = e => {
    const id = e.target.value;
    const selected = contests.find(c => c.id === id);
    setSelectedContest(selected);
    setRankData(null); // Clear rank data when contest changes to trigger re-fetch
    setFilteredRankData([]);
    setCountdown(null);
    setError(null); // Clear any existing errors
    setIsLoadingRank(false); // Reset loading state for rank data
    navigate(id ? `/contests?id=${id}` : '/contests');
  };

  const handleRankFilter = e => {
    const filter = e.target.value.toLowerCase();
    if (!rankData) return;
    const filtered = rankData.data.filter(row => {
      const team = row['Team'] || '';
      const vjudgeHandle = team.match(/^([^\(]+)\(/)?.[1]?.trim() || team;
      const name = vjudgeToName[vjudgeHandle] || vjudgeHandle;
      return name.toLowerCase().includes(filter) || vjudgeHandle.toLowerCase().includes(filter);
    });
    setFilteredRankData(filtered);
  };

  // Loading state for initial contest fetch
  if (isLoadingContests) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gray-900 flex flex-col items-center justify-center"
      >
        <main className="max-w-7xl mx-auto px-4 pt-20 pb-12 flex-grow">
          <p className="text-gray-200 text-2xl font-semibold text-center font-['Inter']">Loading contests...</p>
        </main>
      </motion.div>
    );
  }

  // Error state for initial contest fetch (if no selectedContest)
  if (error && !selectedContest) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gray-900 flex flex-col items-center justify-center"
      >
        <main className="max-w-7xl mx-auto px-4 pt-20 pb-12 flex-grow">
          <p className="text-red-500 text-2xl font-semibold text-center font-['Inter'] mb-4">{error}</p>
          <button
            onClick={() => {
              // Reset states to retry fetching contests
              setIsLoadingContests(true);
              setError(null);
              setContests([]);
              setSelectedContest(null);
              navigate('/contests'); // Optionally navigate to clear search params
            }}
            className="mx-auto block px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:scale-105 transition-all duration-300 text-sm font-semibold font-['Inter']"
          >
            Retry
          </button>
        </main>
      </motion.div>
    );
  }

  // No contests available after loading
  if (!selectedContest && contests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gray-900 flex flex-col items-center justify-center"
      >
        <main className="max-w-7xl mx-auto px-4 pt-20 pb-12 flex-grow">
          <p className="text-gray-200 text-2xl font-semibold text-center font-['Inter']">No contests available</p>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-900 flex flex-col"
    >
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-12 flex-grow">
        <section className="mb-8">
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-gray-800/90 to-gray-900/30 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-700/70 group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <h2 className="text-3xl font-bold font-['Inter'] text-indigo-300 flex items-center gap-2 group-hover:text-indigo-200 transition-colors">
                <FaTrophy className="text-indigo-400 group-hover:text-indigo-300" />
                {selectedContest.name}
              </h2>
              <a
                href={selectedContest.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-105 transition-all duration-300 text-sm font-semibold font-['Inter']"
              >
                {contestStatus === 'waiting' || contestStatus === 'ranked' ? 'View Contest' : 'Join Contest'}
              </a>
            </div>
            <div className="space-y-4">
              <p className="text-base text-gray-200 font-['Inter'] flex items-center gap-2 group-hover:text-gray-100 transition-colors">
                <FaCalendar className="text-indigo-400 group-hover:text-indigo-300" />
                {moment.tz(selectedContest.date, 'YYYY-MM-DD HH:mm', 'Asia/Dhaka').format('MMMM D,YYYY, h:mm A')}
              </p>
              <p className="text-base text-gray-200 font-['Inter'] flex items-center gap-2 group-hover:text-gray-100 transition-colors">
                <FaClock className="text-indigo-400 group-hover:text-indigo-300" />
                Duration: {formatDurationToText(selectedContest.duration)}
              </p>
              <p className="text-base text-gray-200 font-['Inter'] flex items-center gap-2 group-hover:text-gray-100 transition-colors">
                <FaUsers className="text-indigo-400 group-hover:text-indigo-300" />
                Problem Setter(s): <span className="font-medium">{selectedContest.problem_setters}</span>
              </p>
              <p className="text-base text-gray-200 font-['Inter'] flex items-center gap-2 group-hover:text-gray-100 transition-colors">
                <FaLock className="text-indigo-400 group-hover:text-indigo-300" />
                Password: <span className="font-medium text-indigo-300">{selectedContest.password || 'None'}</span>
              </p>
              <p className="text-base text-gray-200 font-['Inter'] flex items-center gap-2 group-hover:text-gray-100 transition-colors">
                <FaInfoCircle className="text-indigo-400 group-hover:text-indigo-300" />
                {selectedContest.description}
              </p>
            </div>
          </div>
        </section>
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label htmlFor="contestSelect" className="font-semibold text-gray-200 font-['Inter']">
                Select a Contest:
              </label>
              <select
                id="contestSelect"
                value={selectedContest?.id || ''}
                onChange={handleContestSelect}
                className="border border-gray-700 rounded-lg px-4 py-2 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 font-['Inter']"
              >
                <option value="">Select a Contest</option>
                {contests.map(contest => (
                  <option key={contest.id} value={contest.id}>
                    {contest.name}
                  </option>
                ))}
              </select>
            </div>
            {contestStatus === 'ranked' && (
              <input
                type="text"
                id="rankFilter"
                placeholder="Search for a coder..."
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 font-['Inter']"
                onChange={handleRankFilter}
              />
            )}
          </div>
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/30 rounded-2xl p-6 shadow-xl border border-gray-700/70">
            {(contestStatus !== 'ranked' || countdown) && (
              <div className="mb-6 text-center">{countdown}</div>
            )}
            {contestStatus === 'ranked' && (
              <>
                {isLoadingRank ? (
                  <p className="text-gray-200 text-center font-['Inter']">Loading rank data...</p>
                ) : error ? (
                  <p className="text-red-500 text-center font-['Inter']">{error}</p>
                ) : rankData ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border-collapse bg-gray-800/20 rounded-lg">
                      <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-gray-200">
                        <tr>
                          <th className="px-4 py-3 border-b border-gray-700 font-semibold font-['Inter']">Rank</th>
                          <th className="px-4 py-3 border-b border-gray-700 font-semibold font-['Inter']">Name</th>
                          <th className="px-4 py-3 border-b border-gray-700 font-semibold font-['Inter']">Solved</th>
                          <th className="px-4 py-3 border-b border-gray-700 font-semibold font-['Inter']">Penalty</th>
                          {rankData.problemColumns.map(col => (
                            <th key={col} className="px-4 py-3 border-b border-gray-700 font-semibold font-['Inter']">
                              <div>{parseProblemName(col)[0]}</div>
                              <div>{parseProblemName(col)[1]}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRankData
                          .filter(row => row && row['Team'] && row['Team'].trim())
                          .map((row, rowIndex) => {
                            const team = row['Team'] || '';
                            const score = parseInt(row['Score'] || '0');
                            const vjudgeHandle = team.match(/^([^\(]+)\(/)?.[1]?.trim() || team.trim();
                            const name = vjudgeToName[vjudgeHandle] || vjudgeHandle;
                            if (!name || !name.trim()) return null;

                            let totalAcceptedTimeSeconds = 0; // Renamed for clarity
                            let totalIncorrectSubmissionsForAccepted = 0; // Renamed for clarity
                            rankData.problemColumns.forEach((_, colIndex) => {
                              const colName = rankData.headers[4 + colIndex];
                              const submission = row[colName] || '';
                              // Destructure only isSolved, seconds, and incorrect
                              const { isSolved, seconds, incorrect } = parseSubmission(submission);
                              if (isSolved) {
                                totalAcceptedTimeSeconds += seconds;
                                totalIncorrectSubmissionsForAccepted += incorrect;
                              }
                            });
                            // Calculate total penalty in minutes
                            const totalPenalty = Math.floor((totalAcceptedTimeSeconds / 60) + (totalIncorrectSubmissionsForAccepted * 20));

                            return (
                              <tr key={rowIndex} className="transition-all duration-300 hover:bg-gray-800/50">
                                <td className="px-4 py-2 border-b border-gray-700 text-center text-gray-200 font-['Inter']">{rowIndex + 1}</td>
                                <td className="px-4 py-2 border-b border-gray-700 text-gray-200 font-['Inter']">
                                  <div className="font-semibold">{name}</div>
                                  <a
                                    href={`https://vjudge.net/user/${vjudgeHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-indigo-400 hover:underline text-xs"
                                  >
                                    {vjudgeHandle}
                                  </a>
                                </td>
                                {/* <td className="px-4 py-2 border-b border-gray-700 font-semibold">
                                  <a
                                    href={`https://vjudge.net/user/${vjudgeHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-indigo-400 hover:underline"
                                  >
                                    {vjudgeHandle}
                                  </a>
                                </td> */}
                                <td className="px-4 py-2 border-b border-gray-700 text-center text-gray-200 font-['Inter']">{score}</td>
                                <td className="px-4 py-2 border-b border-gray-700 text-center text-gray-200 font-['Inter']">{totalPenalty}</td>
                                {rankData.problemColumns.map((_, colIndex) => {
                                  const colName = rankData.headers[4 + colIndex];
                                  let  cellValue = row[colName] || '';
                                  const { isSolved, incorrect, seconds } = parseSubmission(cellValue);
                                  cellValue = formatSubmissionData(cellValue);
                                  console.log(`${cellValue}`);
                                  
                                  // Check if this participant's vjudgeHandle matches the first solver for this problem
                                  const isFirstSolver = rankData.firstSolvers[colName] === vjudgeHandle; 

                                  let cellBgClass = "";
                                  let cellTextColorClass = "text-gray-200"; // Default text color for untouched cells

                                  if (isSolved) {
                                    if (isFirstSolver) {
                                      cellBgClass = 'bg-yellow-900'; // First solve: a distinct yellow
                                      cellTextColorClass = 'text-yellow-300'; // Contrasting text for yellow
                                    } else {
                                      cellBgClass = 'bg-green-900'; // Solved: a distinct green
                                      cellTextColorClass = 'text-green-300'; // Contrasting text for green
                                    }
                                  } else if (incorrect > 0) {
                                    cellBgClass = 'bg-red-900'; // Incorrect attempts: a distinct red
                                    cellTextColorClass = 'text-red-300'; // Contrasting text for red
                                  } else {
                                    // Default background for unsolved/untouched cells, keep it subtle
                                    cellBgClass = 'bg-gray-800/20'; // Matching table background or slightly different
                                    cellTextColorClass = 'text-gray-400'; // Lighter text for subtle cell
                                  }
                                  return (
                                    <td
                                      key={colName}
                                      className={`px-4 py-2 border-b border-gray-700 text-center font-medium ${cellBgClass} ${cellTextColorClass}`}
                                    >
                                      {cellValue[0] && cellValue[1] ? (
                                        <>
                                          {cellValue[0]}<br/>
                                          {cellValue[1]}
                                        </>
                                      ) : cellValue[0] ? (
                                        cellValue[0]
                                      ) : cellValue[1] ? (
                                        cellValue[1]
                                      ) : (
                                        ''
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        {filteredRankData.length === 0 && (
                          <tr>
                            <td
                              colSpan={5 + (rankData.problemColumns?.length || 0)}
                              className="px-4 py-2 border-b border-gray-700 text-center font-semibold text-gray-200 font-['Inter']"
                            >
                              No participants found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 font-semibold text-center font-['Inter']">No rank data available.</p>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </motion.div>
  );
}

export default Contests;