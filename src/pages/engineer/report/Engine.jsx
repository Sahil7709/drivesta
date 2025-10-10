import React, { useState, useRef, useEffect } from "react";

const Engine = ({ data = {}, onChange }) => {
  const conditionIssues = [ 
    "Bearing Roughness Or Noise",
    "There Has Been A Timing Belt Replacement",
    "Low Or No Pressure When Activating The Washers",
    "Fluid Leaking Out From Under The Vehicle",
    "Filling The Reservoir More Often Than Usual",
    "Sprayers Donot Spray Far Enough On The Windshield Or Do Not Spray Enough Fluid.",
    "Pieces Of The Pulley Visibly Missing Or Damaged",
    "Coolant Leaks Or Overheating",
    "Oil Is Present In The PCV Valve",
    "Blue Smoke From The Exhaust",
    "Heater Does Not Produce Much Warm Air In Stop-And-Go Traffic.",
    "Engine Drive Belt Or Serpentine Belt Shows Excessive Wear.",
    "Grinding Or Screeching Noises While The Engine Running.",
    "Engine Oil And/Or Coolant Leaking",
    "A Rasping Or Grating Sound Coming From The Front Of The Engine.",
    "Missed Timing Marks",
    "Oil Seepage Or Dripping",
    "Oil Accumulating Inside The Spark Plug",
    "Oil Leakage At The Rubber Grommets",
    "There Is No Throttle Response When The Pedal Is Pressed.",
    "Vehicle May Hesitate, Misfire, Or Jerk On Acceleration",
    "Engine Stalls",
    "Experience Sudden Surges In Speed While Driving",
    "Check Engine Light Is Flashing",
    "Flapping Noise Under The Hood From A Shredded Or Broken Belt.",
    "Temperature Gauge Reads Too Low Or Too High",
    "Reduced Power Warning Light On",
    "Wrong Idle Speed",
    "Poor / Difficult Transmission Shifting",
    "The Accelerator Sticks, Either When Pressing Or Releasing The Pedal.",
    "Squealing Noise, Belt Slippage, Visible Belt Damage",
    "Intermittent Operation Of The Starter.",
    "Starter Turns Too Slowly",
    "Unusual Noises On Starting",
    "Starter Doesnot Function When Turning The Key",
    "Sudden Loss Of Power In Car.",
    "Belt Breaks Or The Steering Becomes Difficult",
    "Squealing Noise Is Heard",
    "Car's Overflow Bottle Fills Up",
    "A Temperature Gauge That Has Moved Higher Than Its Normal Position.",
    "Old Coolant Mixtures Has Become Corrosive And Abrasive.",
    "Coolant (Red, Yellow, Green Fluid) Is Leaking",
    "Engine Cranks Well But Doesnot Fire",
    "Engine Doesnot Start Easily, Even With A Good Battery And Starter.",
    "Leaks In The Engine Compartment",
    "Leaks Underneath The Car",
    "Car Runs Poorly",
    "Belt Looks Worn",
    "Low Engine Oil",
    "Oil Visible Around The Timing Cover",
    "Oil Visible Around Intake Manifold",
    "Oil Temperature Gauge Does Not Work",
    "Oil Temperature Gauge Works Erratically Or Reads Incorrectly.",
    "Engine Is Running Rough",
    "Smoke From Engine Compartment Due To Oil Leaking On Hot Exhaust Pipes.",
    "Oil Leaks Underneath Your Car Where The Oil Pan Is Located.",
    "Streaks Of Oil Underneath Your Vehicle That Are Right Behind Your Oil Pan.",
    "Oil Pressure Light Is On",
    "Oil Pressure Light Turns On And Off",
    "Discharges Of Black, Oil Exhaust As Unburned Oil Is Released As Part Of The Ignition Cycle.",
    "Oil Dripping From The Oil Filter On An External, Bottom Mounted Filter.",
    "Oil Leaking Around The Intake Manifold On A Top Mounted, Internal Oil Filter.",
    "Consistent Oil Leak In The Same Spot Under Your Car",
    "Oil Leak Around The Mounting Location Of The Cooler",
    "Oil Leak Around The Oil Cooler Line Fittings",
    "Bends, Crimps Or Damage To The Lines",
    "Engine Power Loss Due To Oil Contamination",
    "Engine Misfiring Due To Oil Fouling",
    "Engine Coolant Temperature Rise And Potential Damage Due To Oil Contamination.",
    "Internal Or External Engine Coolant Leaks",
    "External Oil Leaks",
    "Poor Engine Operation, Lean Operation, Rough Idle",
    "Poor Fuel Economy",
    "Erratic Or Rough Idling",
    "Low Oil Level",
    "The Engine Temperature Doesnot Reach Operating Temperature.",
    "The Radiator Is Leaking Fluid",
    "Engine Stalls On Idle",
    "Excessive Racing Noise From The Engine",
    "Engine May Shut Off If AC Is Turned On",
    "Loss Of Power Steering",
    "Oil Leaking From The Front Crank Pulley",
    "Oil Dripping From The Bottom Of The Clutch Housing",
    "Clutch Slip Caused By Oil Spraying On The Clutch",
    "A Strong Smell Of Coolant",
    "A Puddle Of Yellow-Green Fluid (Coolant) Under Your Car.",
    "Car Does Not Run Smoothly",
    "Loud Noise From The Engine",
    "Lack Of Engine Performance",
    "Smells From The Engine Compartment",
    "Rattling Or Vibrating In The Engine Compartment",
    "Scraping Or Clicking Noise Coming From The Engine Compartment",
    "Loud Noise When You Put The Car In Gear",
    "Vibration When Accelerating Or Driving Uphill",
    "You Will Feel A Movement In The Engine Compartment When Driving The Car.",
    "Oil Leaking From Damaged Mount (Only In Case Of Fluid Filled Mounts).",
    "Engine Rattles During Acceleration",
    "Engine Has Trouble Idling",
    "Engine Will Turn Over But Not Start",
    "Engine Will Alternate Surging And A Loss Of Power When Driving.",
    "Engine Stumbles Or Stalls When Accelerating From A Stop.",
    "Knocking Noise From The Engine On Acceleration",
    "Engine Or Transmission Movement, With Bumping Or Clunking Noises.",
    "Rough Run And Loss Of Power",
    "Worn Or Damaged Integral Parts Of The Distributor",
    "Visible Oil Leaks",
    "Noises From The Engine",
    "Loud, Abnormal Engine Noise, Which Increases With Acceleration.",
    "Throttle Will Not Adjust While Cruise Control Is Set",
    "Cruise Control Will Not Set At All",
    "Engine May Race If The Cruise Control Cable Gets Stuck.",
    "Noticeable Oil Leak At The Base Of The Distributor By The Valve Cover.",
    "Engine Overheating",
    "Cooling Fan Runs Intermittently",
    "Erratic Coolant Temperature",
    "Engine Misfires, Stalls Or Idles Roughly",
    "Cooling Fan Fuse Is Blown",
    "Vibration From Engine.",
    "Temperature Gauge Is Reaching The 'H' Level Or Red Area.",
    "Low/Check Coolant Warning Light Is On",
    "Visible Leak Or Puddle Under Vehicle",
    "A Sweet Smell When The Engine Is Running Or Just Shut Off.",
    "Coolant Leaking Onto The Ground When Engine Is Hot.",
    "Battery Light On In Dashboard",
    "Vehicle Does Not Crank",
    "Oil Leaking From Behind The Timing Cover",
    "Timing Belt Slips Or Is Damaged",
    "Engine Leaks Or Smells Like Raw Fuel",
    "Backfiring Or Popping Through The Exhaust",
    "Steam Escaping From Under The Hood",
    "Battery Is Dead",
    "Engine Will Not Start",
    "Engine Starts But Stalls And Dies",
    "Engine Burns Too Much Or Too Little Fuel",
    "Engine Knocks",
    "Green Or White Corrosion Around Battery Terminals.",
    "Car Experiences Reduced Power While Accelerating",
    "Battery Warning Light Is On",
    "Interior Lights And Headlights Flicker And Dim",
    "Engine Stalls While Driving And Will Not Turn Over To Restart.",
    "Flapping Sound Of A Frayed Belt Might Be Heard Under The Hood.",
    "Bleeder Valve Is Damaged In Some Way That Compromises Operation",
    "The Housing Is Leaking Coolant.",
    "Check Engine Light On With Check Valve Failure Code",
    "The Car Does Not Pass The Emission Test",
    "Engine Idles / Runs Rough",
    "Check Engine Light Is on.",
    "Noise, Such As Squealing When The Air Conditioner Is Turned On.",
    "Visual Inspection Shows Fraying, Stretching, Or Weakening Of The Belt.",
    "The Belt Breaks",
    "Delayed Response To Acceleration",
    "Car Jerking During Cruise Mode",
    "Bleeder Valve Will Not Open."
  ];

  // Convert into options with value + label
  const options = conditionIssues.map((issue, idx) => ({
    value: issue,
    label: issue,
  }));

  const [selectedIssues, setSelectedIssues] = useState(() => {
    if (Array.isArray(data.engine_issues)) return data.engine_issues;
    if (data.engine_issue && data.engine_issue !== "none")
      return [data.engine_issue];
    return [];
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // <-- Add search state
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (onChange) onChange("engine_issues", selectedIssues);
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
    : "Select engine issues";

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white relative">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">
        Engine Issues
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

export default Engine;
