// ice-pc\src\components\Footer.jsx
import React from 'react';
import facebook from "/assets/images/facebook.png";
import group from "/assets/images/group.png";
import codeforces from "/assets/images/codeforces.png";
import github from "/assets/images/github.png";
import leetcode from "/assets/images/leetcode.png";
import messenger from "/assets/images/messenger.png";
import linkedin from "/assets/images/linkedin.png";

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-indigo-950 to-purple-950 text-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-xl font-semibold font-['Inter'] mb-2">ICE Programming Club</p>
        <p className="text-sm font-['Inter'] mb-4">Department of Information and Communication Engineering, University of Rajshahi</p>
        <p className="text-sm font-['Inter'] mb-4">© 2025 ICE PC. All rights reserved.</p>
        <p className="text-sm font-['Inter'] mb-2">Connect with ICE PC:</p>
        <div className="flex justify-center gap-6 mb-6 flex-wrap">
          <div className="flex flex-col items-center">
            <a
              href="https://facebook.com/ruiceprogrammingclub"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-105 transition-all duration-300"
            >
              <img
                src={facebook} // Updated path
                alt="ICE PC Facebook Page"
                className="w-10 h-10 object-contain invert"
              />
            </a>
            <span className="text-xs font-['Inter'] mt-1">Facebook Page</span>
          </div>
          <div className="flex flex-col items-center">
            <a
              href="https://facebook.com/groups/1408285125903889"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-105 transition-all duration-300"
            >
              <img
                src={group} // Updated path
                alt="ICE PC Facebook Group"
                className="w-10 h-10 object-contain invert"
              />
            </a>
            <span className="text-xs font-['Inter'] mt-1">Facebook Group</span>
          </div>
          <div className="flex flex-col items-center">
            <a
              href="https://m.me/j/AbYx1vAhjhLhI0ky/"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-105 transition-all duration-300"
            >
              <img
                src={messenger} // Updated path
                alt="ICE PC Messenger Group"
                className="w-10 h-10 object-contain invert"
              />
            </a>
            <span className="text-xs font-['Inter'] mt-1">Messenger</span>
          </div>
        </div>
        <div className="text-sm font-semibold font-['Inter'] mb-6">
          <p>Built by Saifullah Mansur, ICE '21</p>
          <p>with Grok AI sparking vibe coding</p>
        </div>
        <div className="flex justify-center gap-6 mb-6 flex-wrap">
          <div className="flex flex-col items-center">
            <a
              href="https://github.com/SaifullahMnsur-Again"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-105 transition-all duration-300"
            >
              <img
                src={github} // Updated path
                alt="GitHub Profile"
                className="w-10 h-10 object-contain invert"
              />
            </a>
            <span className="text-xs font-['Inter'] mt-1">GitHub</span>
          </div>
          <div className="flex flex-col items-center">
            <a
              href="https://codeforces.com/profile/SaifullahMnsur"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-105 transition-all duration-300"
            >
              <img
                src={codeforces} // Updated path
                alt="Codeforces Profile"
                className="w-10 h-10 object-contain"
              />
            </a>
            <span className="text-xs font-['Inter'] mt-1">Codeforces</span>
          </div>
          <div className="flex flex-col items-center">
            <a
              href="https://leetcode.com/u/SaifullahMnsur"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-105 transition-all duration-300"
            >
              <img
                src={leetcode} // Updated path
                alt="LeetCode Profile"
                className="w-10 h-10 object-contain invert"
              />
            </a>
            <span className="text-xs font-['Inter'] mt-1">LeetCode</span>
          </div>
          <div className="flex flex-col items-center">
            <a
              href="https://linkedin.com/in/saifullahmnsur"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-105 transition-all duration-300"
            >
              <img
                src={linkedin} // Updated path
                alt="LinkedIn Profile"
                className="w-10 h-10 object-contain invert"
              />
            </a>
            <span className="text-xs font-['Inter'] mt-1">LinkedIn</span>
          </div>
        </div>
        <a
          href="https://github.com/SaifullahMnsur/ice-pc"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-100 transition-colors duration-300 font-['Inter'] text-sm"
        >
          View Source Code on GitHub
        </a>
      </div>
    </footer>
  );
}

export default Footer;