import React, { useState, useEffect, useRef } from "react";

const Transmission = ({ data = {}, onChange }) => {
  const issues = ["Slipping", "Hard Shifting", "Delayed Engagement", "Noisy Gear"];

  const [selectedIssues, setSelectedIssues] = useState(() => 
    Array.isArray(data.transmission_issues) ? data.transmission_issues : []
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    onChange && onChange("transmission_issues", selectedIssues);
  }, [selectedIssues, onChange]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleIssue = (issue) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  const displayText = selectedIssues.length > 0 ? selectedIssues.join(", ") : "Select Transmission Issues";

  const filteredIssues = issues.filter((issue) =>
    issue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Transmission Issues</h2>
      <div ref={dropdownRef} className="relative w-full">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full p-2 bg-gray-800 text-white rounded-md border border-white/20 text-left flex justify-between items-center"
        >
          <span>{displayText}</span>
          <span>{dropdownOpen ? "▲" : "▼"}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-white/20 rounded-md shadow-lg max-h-60 overflow-auto p-2">
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 mb-2 rounded bg-gray-700 text-white border border-white/20"
            />
            {filteredIssues.length === 0 ? (
              <div className="px-2 py-1 text-gray-400">No issues found</div>
            ) : (
              filteredIssues.map((issue) => (
                <label
                  key={issue}
                  className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-700 rounded-md"
                >
                  <input
                    type="checkbox"
                    checked={selectedIssues.includes(issue)}
                    onChange={() => toggleIssue(issue)}
                    className="w-4 h-4"
                  />
                  <span>{issue}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transmission;
