import React from "react";

const OtherObservations = ({ data = {}, onChange }) => {
  const handleObservationChange = (e) => {
    if (typeof onChange === "function") {
      onChange("other_observations", e.target.value);
    }
  };

  const handleScoreChange = (e) => {
    const score = Math.max(0, Math.min(10, Number(e.target.value) || 0));
    if (typeof onChange === "function") {
      onChange("overall_score", score);
    }
  };

  const score = data.overall_score ?? 0;

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white text-left">
        Other Observations
      </h2>

      <textarea
        value={data.other_observations || ""}
        onChange={handleObservationChange}
        placeholder="Enter any other observations..."
        className="w-full p-3 border border-white/20 rounded bg-[#ffffff0a] text-white focus:outline-none focus:ring-2 focus:ring-lime-500 resize-none"
        rows={5}
      />

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Overall Score (0–10)
        </label>
        <input
          type="number"
          min="0"
          max="10"
          value={score}
          onChange={handleScoreChange}
          className="w-32 p-2 border border-white/20 rounded bg-[#ffffff0a] text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
        />
      </div>
    </div>
  );
};

export default OtherObservations;
