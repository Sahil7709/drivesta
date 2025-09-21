import React from 'react';

const FluidCard = ({ fluidName, withinRange, onWithinRangeChange, contamination, onContaminationChange }) => {
  const handleCheckboxChange = (e, callback) => {
    const scrollY = window.scrollY;
    callback(e.target.checked);
    window.scrollTo(0, scrollY);
  };

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full">
      <h3 className="text-lg sm:text-xl font-medium mb-4 text-white text-left">{fluidName}</h3>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={withinRange}
            onChange={(e) => handleCheckboxChange(e, onWithinRangeChange)}
            className="w-5 h-5 text-lime-500 bg-gray-600 border-white/20 rounded focus:ring-lime-500 focus:ring-2"
          />
          <span className="text-white text-sm">Within Range</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={contamination}
            onChange={(e) => handleCheckboxChange(e, onContaminationChange)}
            className="w-5 h-5 text-lime-500 bg-gray-600 border-white/20 rounded focus:ring-lime-500 focus:ring-2"
          />
          <span className="text-white text-sm">Contamination</span>
        </label>
      </div>
    </div>
  );
};

const FluidLevels = ({ data = {}, onChange }) => {
  const fluidsList = [
    { id: "coolant", name: "1. Coolant" },
    { id: "engineOil", name: "2. Engine Oil" },
    { id: "brakeOil", name: "3. Brake Oil" },
    { id: "washerFluid", name: "4. Washer Fluid" },
  ];

  // Call onChange with field and value when checkbox toggled
  const handleToggle = (field, value) => {
    if (typeof onChange === 'function') {
      onChange(field, value);
    }
  };

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white text-left">Fluid Levels</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-6">
        {fluidsList.map(({ id, name }) => (
          <FluidCard
            key={id}
            fluidName={name}
            withinRange={data[`fluid_${id}_withinRange`] ?? true}
            onWithinRangeChange={(checked) => handleToggle(`fluid_${id}_withinRange`, checked)}
            contamination={data[`fluid_${id}_contamination`] ?? false}
            onContaminationChange={(checked) => handleToggle(`fluid_${id}_contamination`, checked)}
          />
        ))}
      </div>
    </div>
  );
};

export default FluidLevels;