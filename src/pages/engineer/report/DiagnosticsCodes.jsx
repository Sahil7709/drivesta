import React, { useState, useEffect } from 'react';

const DiagnosticsCodes = ({ data = {}, onChange }) => {
  // data.diagnostic_codes is expected to be an array of codes
  const [code, setCode] = useState('');
  const [codeList, setCodeList] = useState(data.diagnostic_codes || []);

  // Sync local codeList when parent data changes
  useEffect(() => {
    setCodeList(data.diagnostic_codes || []);
  }, [data.diagnostic_codes]);

  const handleAddCode = () => {
    if (code.trim()) {
      const updatedList = [...codeList, code.trim()];
      setCodeList(updatedList);
      setCode('');
      if (typeof onChange === 'function') {
        onChange('diagnostic_codes', updatedList);
      }
    }
  };

  const handleRemoveCode = (indexToRemove) => {
    const updatedList = codeList.filter((_, index) => index !== indexToRemove);
    setCodeList(updatedList);
    if (typeof onChange === 'function') {
      onChange('diagnostic_codes', updatedList);
    }
  };

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white text-left">
        Diagnostic Codes
      </h2>
      <div className="flex flex-col w-full gap-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter diagnostic code"
          className="w-full p-2 border border-white/20 rounded bg-[#ffffff0a] text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
        />
        <div className="flex justify-end">
          <button
            onClick={handleAddCode}
            className="px-5 py-2 bg-gradient-to-r from-lime-500 to-green-600 text-white rounded-lg hover:from-lime-600 hover:to-green-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lime-500 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Add
          </button>
        </div>
        {codeList.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium text-white mb-2">Added Codes:</h3>
            <div className="flex flex-col gap-2">
              {codeList.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-[#ffffff0a] border border-white/10 rounded-lg p-3 text-sm text-white hover:bg-[#ffffff1a] transition-colors duration-200"
                >
                  <span>{code}</span>
                  <button
                    onClick={() => handleRemoveCode(index)}
                    className="text-red-400 hover:text-red-500 focus:outline-none"
                    title="Remove code"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticsCodes;
