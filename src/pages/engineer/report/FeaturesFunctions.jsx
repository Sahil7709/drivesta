import React, { useState, useEffect, useRef } from "react";

// Toggle switch component
const ToggleButton = ({ checked, onChange, label }) => {
  return (
    <label className="flex flex-col items-center cursor-pointer">
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        <div className={`w-10 h-5 bg-gray-600 rounded-full shadow-inner ${checked ? "bg-lime-500" : ""}`}>
          <div
            className={`absolute w-5 h-5 bg-white rounded-full shadow -left-1 top-0 transition-transform duration-200 ease-in-out ${
              checked ? "transform translate-x-5" : ""
            }`}
          />
        </div>
      </div>
      {label && <span className="mt-1 text-white text-sm">{label}</span>}
    </label>
  );
};

// Main FeaturesFunctions component
const FeaturesFunctions = ({ data, onChange }) => {
  const featurePanels = [
    "feature_parking_sensors_front",
    "feature_parking_sensors_rear",
    "feature_front_view_camera",
    "feature_rear_view_camera",
    "feature_camera_360",
    "feature_touch_screen",
    "feature_speakers",
    "feature_electric_orvm",
    "feature_auto_dimming_irvm",
    "feature_ventilated_seat_driver",
    "feature_ventilated_seat_codriver",
    "feature_ventilated_seat_rear",
  ];

  // const getInitialState = () => {
  //   const initState = {};
  //   featurePanels.forEach((key) => {
  //     initState[key] = {
  //       available: true,
  //       issueObserved: false,
  //     };
  //     if (data && data[key]) {
  //       initState[key] = { ...initState[key], ...data[key] };
  //     }
  //   });
  //   return initState;
  // };

  // Only initialize from data once
  // const [toggleStates, setToggleStates] = useState(getInitialState);

  // const handleToggleChange = (key, type) => {
  //   setToggleStates((prev) => {
  //     const updated = { ...prev, [key]: { ...prev[key], [type]: !prev[key][type] } };
  //     // Save to backend
  //     if (onChange) onChange(key, updated[key]);
  //     return updated;
  //   });
  // };

  const handleToggleChange = (key, type) => {
  const fieldName = `${key}_${type}`; // e.g. feature_parking_sensors_front_available
  const currentValue = !!data[fieldName];
  onChange(fieldName, !currentValue);
};


  const formatLabel = (key) =>
    key
      .replace(/^feature_/, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace("360", "360°");

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white text-left">
        Features & Functions
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:gap-6">
        {featurePanels.map((key, idx) => (
          <div key={key} className="flex flex-col w-full">
            <label className="text-md text-white font-medium mb-2 text-left">
              {`${idx + 1}. ${formatLabel(key)}`}
            </label>
            <div className="flex justify-center items-center gap-20">
              <ToggleButton
                // checked={!!toggleStates[key]?.available}
                checked={!!data[`${key}_available`]}
                onChange={() => handleToggleChange(key, "available")}
                label="Available"
              />
              <ToggleButton
                checked={!!data[`${key}_issueObserved`]}
                onChange={() => handleToggleChange(key, "issueObserved")}
                label="Issue Observed"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesFunctions;