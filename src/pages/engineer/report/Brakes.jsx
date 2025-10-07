import React, { useState, useRef, useEffect } from "react";

const Brakes = ({ data = {}, onChange }) => {
  // Full list of brake condition issues
  const conditionIssues = [
    "Brake Pedal Feels Spongy",
    "Discoloured Brake Fluid (Black Or Brown)",
    "Diminished Brake System Performance",
    "Abnormal Squealing Noise From Brakes",
    "When Braking, The Car Will Pull Hard Left Or Right",
    "Brake Fluid Is Leaking",
    "Pulsating Brakes Or Vibration",
    "Vibration Or Noise Upon Brake Application",
    "Loss Of Parking Brake Function", 
    "Physical Damage To The Brake Hose",
    "Brake System Warning Light On",
    "Wear Indicator On Dashboard",
    "Blue Discoloration Of Rotor Surface",
    "Grooves Or Hot Spots In Rotors",
    "Noise From Rear Brakes",
    "Parking Brake Does Not Hold",
    "Car Shakes Upon Braking",
    "Delayed Brake Response",
    "Excessive Pressure Required To Brake",
    "Hissing Sound When Pressing The Brake Pedal",
    "Brake Pedal Slips To The Floor Of The Car When The Engine Is Running And The Car Is Stationary",
    "Brake Pedal Goes All The Way To The Floor",
    "Parking Brake Does Not Release",
    "Parking Brake Warning Light Is On",
    "There Is Limited To No Resistance In The Parking Brake Pedal / Lever",
    "Parking Brake Pedal / Lever Does Not Enagage",
    "Parking Brake Pedal Does Not Disengage",
    "Brake Pedal Is Very Hard To Press",
    "Brake Pedal Begins As Easy To Press Then Becomes Very Difficult",
    "Heater Controls Donot Operate Properly",
    "A Hissing Air Sound Is Present",
    "Loose Steering",
    "Excessive Brake Pedal Travel Before Brake Application",
    "Grinding Noise From The Front Hub",
    "ABS Warning Light Is On",
    "ABS System Is Not Working",
  ];

  // Convert issues into options
  const options = conditionIssues.map((issue, idx) => ({
    value: issue,
    label: issue,
  }));

  console.log("Options from brakes"+options);
  

  const [selectedIssues, setSelectedIssues] = useState(() => {
    if (Array.isArray(data.brakes_issues)) return data.brakes_issues;
    if (data.brakes_issue && data.brakes_issue !== "none")
      return [data.brakes_issue];
    return [];
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (onChange) onChange("brakes_issues", selectedIssues);
  }, [selectedIssues, onChange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (value) => {
    setSelectedIssues((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const displayText = selectedIssues.length
    ? options
        .filter((o) => selectedIssues.includes(o.value))
        .map((o) => o.label)
        .join(", ")
    : "Select brake issues";

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white relative">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">
        Brakes Issues
      </h2>

      <div ref={dropdownRef} className="relative w-full">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full p-2 bg-gray-800 text-white rounded-md border border-white/20 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-lime-500"
        >
          <span>{displayText}</span>
          <span className="ml-2">{dropdownOpen ? "▲" : "▼"}</span>
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

export default Brakes;
