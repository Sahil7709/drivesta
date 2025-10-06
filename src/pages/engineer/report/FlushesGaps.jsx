import React from "react";

// ToggleButton reused style (like FeaturesFunctions)
const ToggleCheckbox = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2 mb-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-5 h-5 rounded-md accent-lime-400"
    />
    {label}
  </label>
);

const FlushesGaps = ({ data = {}, onChange }) => {
  const parts = {
    "Bonnet Right": "bonnet_right",
    "Bonnet Left": "bonnet_left",
    "Front Right Door": "front_right_door",
    "Front Left Door": "front_left_door",
    "Rear Right Door": "rear_right_door",
    "Rear Left Door": "rear_left_door",
    "Boot Right": "boot_right",
    "Boot Left": "boot_left",
    "Front Bumper Right": "front_bumper_right",
    "Front Bumper Left": "front_bumper_left",
    "Rear Bumper Right": "rear_bumper_right",
    "Rear Bumper Left": "rear_bumper_left",
  };

  const handleChange = (key, field, value) => {
    onChange(`${key}_${field}`, value);
  };

  const handleInputChange = (e, key, field) => {
    const { type, checked, value } = e.target;
    let newValue;

    if (type === "checkbox") {
      newValue = checked;
    } else if (value === "") {
      newValue = "";
    } else {
      const parsed = parseFloat(value);
      newValue = isNaN(parsed) ? "" : parsed;
    }

    console.log(`Changed: ${key}_${field} =`, newValue); // <-- debug change
    handleChange(key, field, newValue);
  };
  console.log("FlushesGaps data prop:", data);

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">
        Flushes & Gaps
      </h2>

      <div className="space-y-8">
        {Object.entries(parts).map(([label, key]) => (
          <div
            key={key}
            className="p-4 border border-white/20 rounded-xl bg-white/5 shadow-md"
          >
            <h3 className="text-lg font-semibold mb-4">{label}</h3>

            {/* Rough Operation */}
            <ToggleCheckbox
              label="Rough Operation"
              checked={!!data[`${key}_rough_operation`]}
              onChange={(e) => handleInputChange(e, key, "rough_operation")}
            />

            {/* Gap Observed */}
            <ToggleCheckbox
              label="Gap Observed"
              checked={!!data[`${key}_gap_observed`]}
              onChange={(e) => handleInputChange(e, key, "gap_observed")}
            />

            {/* Gap Reading Top */}
            <div className="flex flex-col mb-3">
              <label className="text-sm text-white font-medium mb-1">
                Gap Reading (Top)
              </label>
              <input
                type="number"
                value={data?.[`${key}_gap_reading_top`] ?? ""}
                onChange={(e) => handleInputChange(e, key, "gap_reading_top")}
                placeholder="Enter gap reading top"
                className="p-2 bg-[#ffffff0a] border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400 text-white"
              />
            </div>

            {/* Gap Reading Down */}
            <div className="flex flex-col">
              <label className="text-sm text-white font-medium mb-1">
                Gap Reading (Down)
              </label>
              <input
                type="number"
                value={data?.[`${key}_gap_reading_down`] ?? ""}
                onChange={(e) => handleInputChange(e, key, "gap_reading_down")}
                placeholder="Enter gap reading down"
                className="p-2 bg-[#ffffff0a] border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400 text-white"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlushesGaps;
