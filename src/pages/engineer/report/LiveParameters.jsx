import React from "react";

const ToggleButton = ({ checked, onChange }) => {
  const handleChange = () => {
    const scrollY = window.scrollY;
    onChange();
    window.scrollTo(0, scrollY);
  };

  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="sr-only"
          autoFocus={false}
        />
        <div
          className={`w-10 h-5 bg-gray-600 rounded-full shadow-inner ${
            checked ? "bg-lime-500" : ""
          }`}
        >
          <div
            className={`absolute w-5 h-5 bg-white rounded-full shadow -left-1 top-0 transition-transform duration-200 ease-in-out ${
              checked ? "transform translate-x-5" : ""
            }`}
          />
        </div>
      </div>
    </label>
  );
};

const LiveParameters = ({ data = {}, onChange }) => {
  // Destructure all fields from data with fallback defaults
  const {
    live_engine_load_toggle = false,
    live_engine_load = "",
    live_idle_rpm_toggle = false,
    live_idle_rpm = "",
    live_battery_voltage = "",
    live_distance_since_code_clear = "",
    live_distance_in_current_lock_block = "",
  } = data;

  // Helper to toggle boolean fields
  const handleToggle = (field) => {
    onChange(field, !data[field]);
  };

  // Helper to handle numeric inputs with validation
  const handleValueChange = (field, value, allowDecimal) => {
    const regex = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
    if (regex.test(value)) {
      onChange(field, value);
    }
  };

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white text-left">
        Live Parameters
      </h2>

      {/* Engine Load */}
      <div className="flex flex-col w-full mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-md text-white font-medium text-left">
            1. Engine Load
          </label>
          <ToggleButton
            checked={live_engine_load_toggle}
            onChange={() => handleToggle("live_engine_load_toggle")}
          />
        </div>
        {live_engine_load_toggle && (
          <input
            type="text"
            value={live_engine_load}
            onChange={(e) =>
              handleValueChange("live_engine_load", e.target.value, true)
            }
            placeholder="Enter Engine Load"
            className="w-full p-2 border border-white/20 rounded bg-[#ffffff0a] text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
          />
        )}
      </div>

      {/* Idle RPM */}
      <div className="flex flex-col w-full mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-md text-white font-medium text-left">
            2. Idle RPM
          </label>
          <ToggleButton
            checked={live_idle_rpm_toggle}
            onChange={() => handleToggle("live_idle_rpm_toggle")}
          />
        </div>
        {live_idle_rpm_toggle && (
          <input
            type="text"
            value={live_idle_rpm}
            onChange={(e) =>
              handleValueChange("live_idle_rpm", e.target.value, false)
            }
            placeholder="Enter Idle RPM"
            className="w-full p-2 border border-white/20 rounded bg-[#ffffff0a] text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
          />
        )}
      </div>

      {/* Battery Voltage */}
      <div className="flex flex-col w-full mb-6">
        <label className="text-md text-white font-medium mb-2 text-left">
          3. Battery Voltage
        </label>
        <input
          type="text"
          value={live_battery_voltage}
          onChange={(e) =>
            handleValueChange("live_battery_voltage", e.target.value, true)
          }
          placeholder="Enter Battery Voltage"
          className="w-full p-2 border border-white/20 rounded bg-[#ffffff0a] text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
        />
      </div>

      {/* Distance Since Code Clear */}
      <div className="flex flex-col w-full mb-6">
        <label className="text-md text-white font-medium mb-2 text-left">
          4. Distance traveled Since Code Clear
        </label>
        <input
          type="text"
          value={live_distance_since_code_clear}
          onChange={(e) =>
            handleValueChange(
              "live_distance_since_code_clear",
              e.target.value,
              true
            )
          }
          placeholder="Enter Distance Since Code Clear"
          className="w-full p-2 border border-white/20 rounded bg-[#ffffff0a] text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
        />
      </div>

      {/* Distance In Current Lock Block */}
      <div className="flex flex-col w-full">
        <label className="text-md text-white font-medium mb-2 text-left">
          5. Distance traveled In Current 10K Block
        </label>
        <input
          type="text"
          value={live_distance_in_current_lock_block}
          onChange={(e) =>
            handleValueChange(
              "live_distance_in_current_lock_block",
              e.target.value,
              true
            )
          }
          placeholder="Enter Distance In Current Lock Block"
          className="w-full p-2 border border-white/20 rounded bg-[#ffffff0a] text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
        />
      </div>
    </div>
  );
};

export default LiveParameters;
