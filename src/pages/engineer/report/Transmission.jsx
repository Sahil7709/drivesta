import React, { useState, useRef, useEffect } from 'react';

const Transmission = ({ data = {}, onChange }) => {
  const options = [
    { value: 'slipping', label: 'Slipping' },
    { value: 'hard_shift', label: 'Hard Shifting' },
    { value: 'delayed_engagement', label: 'Delayed Engagement' },
    { value: 'noisy_gear', label: 'Noisy Gear' },
  ];

  const [selectedIssues, setSelectedIssues] = useState(() => {
    if (Array.isArray(data.transmission_issues)) return data.transmission_issues;
    if (data.transmission_issue && data.transmission_issue !== 'none') return [data.transmission_issue];
    return [];
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // <-- Add search state
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Notify parent whenever selectedIssues change
    if (onChange) onChange('transmission_issues', selectedIssues);
  }, [selectedIssues, onChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCheckboxChange = (value) => {
    setSelectedIssues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const displayText = selectedIssues.length
    ? options.filter((o) => selectedIssues.includes(o.value)).map((o) => o.label).join(', ')
    : 'Select transmission issues';

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white relative">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">Transmission Issues</h2>

      <div ref={dropdownRef} className="relative w-full">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full p-2 bg-gray-800 text-white rounded-md border border-white/20 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-lime-500"
        >
          <span>{displayText}</span>
          <span className="ml-2">{dropdownOpen ? '▲' : '▼'}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-white/20 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="px-4 py-2">
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white border border-white/20 mb-2"
              />
            </div>
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-gray-400">No issues found</div>
            ) : (
              filteredOptions.map(({ value, label }) => (
                <label
                  key={value}
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedIssues.includes(value)}
                    onChange={() => handleCheckboxChange(value)}
                    className="w-4 h-4"
                  />
                  <span className="text-white">{label}</span>
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
