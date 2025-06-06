import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';
import { fetchWithRetry } from '../utils/fetchUtils';
import { getCodeforcesRank, handleLink, getYearPrefix } from '../utils/coderUtils';

const CODERS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_rvXyZpvU4zsqMZ10-px2NULkBw5rfCTGUD2HHVYDAjUdZuDuxbgjtkjGtIWHD-lPkvHzLjlnC9Tq/pub?gid=1893792376&single=true&output=csv';

function Coders() {
  const [coders, setCoders] = useState([]);
  const [filteredCoders, setFilteredCoders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCoders() {
      try {
        const response = await fetchWithRetry(CODERS_CSV_URL);
        const csv = await response.text();
        const parsed = Papa.parse(csv.trim(), {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
        });
        if (parsed.errors.length > 0) {
          throw new Error(`CSV parsing errors: ${parsed.errors.map(e => e.message).join(', ')}`);
        }
        const data = parsed.data.map((row, index) => ({
          'Sl. No': row['Sl. No'] || (index + 1).toString(),
          Name: row['Name'] || '-',
          'Student ID': row['Student ID'] || '-',
          Codeforces: row['Codeforces'] || '',
          Vjudge: row['Vjudge'] || '',
          Atcoder: row['Atcoder'] || '',
          Codechef: row['Codechef'] || '',
          max_cf_rank: row['max_cf_rank'] || '-',
          max_cf_rating: row['max_cf_rating'] || '-',
          skip: row['skip'] || '',
          yearPrefix: getYearPrefix(row['Student ID']),
          rating: parseInt(row['max_cf_rating']) || 0,
        }));
        data.sort((a, b) => {
          if (a.yearPrefix === b.yearPrefix) {
            return b.rating - a.rating;
          }
          return a.yearPrefix.localeCompare(b.yearPrefix);
        });
        setCoders(data);
        setFilteredCoders(data);
      } catch (error) {
        console.error('Error fetching coders:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCoders();
  }, []);

  const handleFilter = e => {
    const query = e.target.value.toLowerCase();
    const filtered = coders.filter(
      coder => coder.Name.toLowerCase().includes(query) || coder['Student ID'].toLowerCase().includes(query)
    );
    setFilteredCoders(filtered);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gray-900 flex flex-col"
      >
        <main className="max-w-7xl mx-auto px-4 pt-20 pb-12 flex-grow">
          <p className="text-gray-200 text-2xl font-['Inter'] text-center">loading coders...</p>
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
        <h1 className="text-4xl font-bold font-['Inter'] text-indigo-300 mb-6">Coders List</h1>
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <input
            type="text"
            placeholder="Filter by name or ID..."
            className="w-full sm:w-64 px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 font-['Inter']"
            onChange={handleFilter}
          />
          <a
            href="https://forms.gle/XrhakMQso1d467uH8"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-300 hover:text-indigo-100 transition-all duration-300 font-['Inter']"
          >
            Add/Update Your Info
          </a>
        </div>
        <div className="overflow-x-auto bg-gray-800/50 rounded-lg shadow-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-indigo-950 text-gray-200">
              <tr>
                <th className="px-4 py-3 border-b border-gray-700 font-['Inter']">#</th>
                <th className="px-4 py-3 border-b border-gray-700 font-['Inter']">Name</th>
                <th className="px-4 py-3 border-b border-gray-700 font-['Inter']">Student ID</th>
                <th className="px-4 py-3 border-b border-gray-700 font-['Inter']">Codeforces</th>
                <th className="px-4 py-3 border-b border-gray-700 font-['Inter']">Vjudge</th>
                <th className="px-4 py-3 border-b border-gray-700 font-['Inter']">Atcoder</th>
                <th className="px-4 py-3 border-b border-gray-700 font-['Inter']">Codechef</th>
                <th className="px-4 py-3 border-b border-gray-700 font-['Inter']">Max Rating(Rank)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCoders.map((coder, index) => {
                const shouldSkip = coder.skip.toLowerCase() === 'yes';
                const rankClass = getCodeforcesRank(coder.max_cf_rating);
                const maxDisplay =
                  shouldSkip || coder.max_cf_rating === '-' || coder.max_cf_rank === '-'
                    ? '-'
                    : `${coder.max_cf_rating} (${coder.max_cf_rank})`;
                const codeforcesLink = handleLink(coder.Codeforces, 'Codeforces');
                const vjudgeLink = handleLink(coder.Vjudge, 'Vjudge');
                const atcoderLink = handleLink(coder.Atcoder, 'Atcoder');
                const codechefLink = handleLink(coder.Codechef, 'Codechef');

                return (
                  <tr key={index} className="hover:bg-gray-700 transition-all duration-300">
                    <td className="px-4 py-2 border-b border-gray-700 font-['Inter'] text-gray-200">{index + 1}</td>
                    <td className="px-4 py-2 border-b border-gray-700 font-['Inter'] text-gray-200">{coder.Name}</td>
                    <td className="px-4 py-2 border-b border-gray-700 font-['Inter'] text-gray-200">{coder['Student ID']}</td>
                    <td className="px-4 py-2 border-b border-gray-700 font-['Inter']">
                      {codeforcesLink.url ? (
                        <a
                          href={codeforcesLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-300 hover:text-indigo-100 transition-all duration-300"
                        >
                          {codeforcesLink.display}
                        </a>
                      ) : (
                        <span className="text-gray-200">{codeforcesLink.display}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-700 font-['Inter']">
                      {vjudgeLink.url ? (
                        <a
                          href={vjudgeLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-300 hover:text-indigo-100 transition-all duration-300"
                        >
                          {vjudgeLink.display}
                        </a>
                      ) : (
                        <span className="text-gray-200">{vjudgeLink.display}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-700 font-['Inter']">
                      {atcoderLink.url ? (
                        <a
                          href={atcoderLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-300 hover:text-indigo-100 transition-all duration-300"
                        >
                          {atcoderLink.display}
                        </a>
                      ) : (
                        <span className="text-gray-200">{atcoderLink.display}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-700 font-['Inter']">
                      {codechefLink.url ? (
                        <a
                          href={codechefLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-300 hover:text-indigo-100 transition-all duration-300"
                        >
                          {codechefLink.display}
                        </a>
                      ) : (
                        <span className="text-gray-200">{codechefLink.display}</span>
                      )}
                    </td>
                    <td className={`px-4 py-2 border-b border-gray-700 ${shouldSkip ? '' : rankClass} font-['Inter'] text-gray-200`}>
                      {maxDisplay}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </motion.div>
  );
}

export default Coders;