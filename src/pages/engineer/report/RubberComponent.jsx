import React, { useState, useEffect, useRef } from "react";
import { AiOutlinePlus, AiOutlineCamera, AiOutlineUpload } from "react-icons/ai";
import FileUploaderService from "../../../services/upload-document.service";
import ToggleButton from "../report/ToggleButton";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";
import ServerUrl from "../../../core/constants/serverUrl.constant";

const rubberPanels = [
  "rubber_bonnet",
  "rubber_front_left_door",
  "rubber_rear_left_door",
  "rubber_boot",
  "rubber_rear_right_door",
  "rubber_front_right_door",
  "rubber_front_wiper",
  "rubber_rear_wiper",
  "rubber_sunroof",
];

const labelNames = {
  rubber_bonnet: "Bonnet",
  rubber_front_left_door: "Front Left Door",
  rubber_rear_left_door: "Rear Left Door",
  rubber_boot: "Boot",
  rubber_rear_right_door: "Rear Right Door",
  rubber_front_right_door: "Front Right Door",
  rubber_front_wiper: "Front Wiper",
  rubber_rear_wiper: "Rear Wiper",
  rubber_sunroof: "Sunroof",
};

const photoCount = 5;

const getIssueOptions = (panel) =>
  panel === "rubber_rear_wiper"
    ? ["Fitment Not Proper", "Scratch", "Torn", "Aging And Cracks"]
    : ["Crack", "Chip", "Scratch"];

const RubberComponent = ({ data = {}, onChange }) => {
  const [condition, setCondition] = useState({});
  const [photos, setPhotos] = useState({});
  const [showDropdown, setShowDropdown] = useState(null);
  const [issueSearch, setIssueSearch] = useState({});
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [rearWiperEnabled, setRearWiperEnabled] = useState(data?.rubber_rear_wiper_toggle || false);
  const [sunroofEnabled, setSunroofEnabled] = useState(data?.rubber_sunroof_toggle || false);

  const dropdownRefs = useRef({});

  useEffect(() => {
    // Initialize issues and photos
    const initCondition = {};
    const initPhotos = {};
    rubberPanels.forEach((panel) => {
      const existingIssues = data?.[`${panel}_issues`];
      initCondition[panel] = Array.isArray(existingIssues)
        ? existingIssues
        : existingIssues
        ? [existingIssues]
        : [];

      const imgs = Array.isArray(data?.[`${panel}_imageUrls`]) ? data[`${panel}_imageUrls`] : [];
      initPhotos[panel] = imgs.slice(0, photoCount);
    });
    setCondition(initCondition);
    setPhotos(initPhotos);
  }, [data]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && dropdownRefs.current[showDropdown] && !dropdownRefs.current[showDropdown].contains(event.target)) {
        setShowDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // Toggle functions
  const toggleRearWiper = () => {
    const newVal = !rearWiperEnabled;
    setRearWiperEnabled(newVal);
    onChange && onChange("rubber_rear_wiper_toggle", newVal);
  };

  const toggleSunroof = () => {
    const newVal = !sunroofEnabled;
    setSunroofEnabled(newVal);
    onChange && onChange("rubber_sunroof_toggle", newVal);
  };

  // Issue handling
  const handleConditionChange = (panel, issue) => {
    setCondition((prev) => {
      const current = prev[panel] || [];
      const updated = current.includes(issue) ? current.filter((i) => i !== issue) : [...current, issue];
      onChange && onChange(`${panel}_issues`, updated);
      return { ...prev, [panel]: updated };
    });
  };

  // Photo handling
  const compressImage = async (file) => {
    try {
      return await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true });
    } catch {
      return file;
    }
  };

  const handleFileSelect = async (e, panel) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return toast.error("Select a valid image");
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setActivePanel(panel);
    setShowDropdown(null);
  };

  const handleCancel = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
    setActivePanel(null);
  };

  const handleConfirm = async () => {
    if (!previewFile || !activePanel) return;
    try {
      const compressed = await compressImage(previewFile);
      const uploaded = await FileUploaderService.uploadFileToServer(compressed, activePanel);
      const imageUrl = uploaded.files?.[0]?.fileUrl;
      if (!imageUrl) throw new Error("Upload failed");

      setPhotos((prev) => {
        const arr = prev[activePanel] ? [...prev[activePanel], imageUrl] : [imageUrl];
        const limitedArr = arr.slice(0, photoCount);
        onChange && onChange(`${activePanel}_imageUrls`, limitedArr);
        return { ...prev, [activePanel]: limitedArr };
      });
    } catch {
      toast.error("Upload failed");
    } finally {
      handleCancel();
    }
  };

  const toggleDropdown = (panel) => setShowDropdown((curr) => (curr === panel ? null : panel));

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">Rubber Components</h2>

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {rubberPanels.map((panel, idx) => {
          const panelEnabled =
            (panel !== "rubber_rear_wiper" || rearWiperEnabled) &&
            (panel !== "rubber_sunroof" || sunroofEnabled);

          const selectedIssues = condition[panel] || [];
          const filteredIssues = getIssueOptions(panel).filter((i) =>
            i.toLowerCase().includes((issueSearch[panel] || "").toLowerCase())
          );
          const photosArr = photos[panel] || [];

          return (
            <div key={panel} className="flex flex-col w-full relative border-b border-white/20 pb-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-md text-white font-medium text-left">
                  {`${idx + 1}. ${labelNames[panel]}`}
                </label>
                {(panel === "rubber_rear_wiper" && <ToggleButton checked={rearWiperEnabled} onChange={toggleRearWiper} />) ||
                  (panel === "rubber_sunroof" && <ToggleButton checked={sunroofEnabled} onChange={toggleSunroof} />)}
              </div>

              {panelEnabled && (
                <>
                  {/* Issues */}
                  <div className="mb-4 relative" ref={(el) => (dropdownRefs.current[panel] = el)}>
                    <button
                      type="button"
                      onClick={() => toggleDropdown(panel)}
                      className="w-full bg-gray-800 text-white p-2 rounded-md flex justify-between items-center focus:outline-none"
                    >
                      {selectedIssues.length > 0 ? selectedIssues.join(", ") : "Select Issues"}
                      <span className="ml-2">&#9662;</span>
                    </button>
                    {showDropdown === panel && (
                      <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-white/20 rounded-md shadow-lg max-h-48 overflow-auto p-2">
                        <input
                          type="text"
                          value={issueSearch[panel] || ""}
                          onChange={(e) => setIssueSearch((prev) => ({ ...prev, [panel]: e.target.value }))}
                          placeholder="Search issues..."
                          className="w-full p-2 mb-2 rounded-md bg-gray-700 text-white focus:outline-none"
                        />
                        {filteredIssues.map((issue) => (
                          <label
                            key={issue}
                            className="flex items-center gap-2 px-2 py-1 cursor-pointer text-white hover:bg-gray-700 rounded-md"
                          >
                            <input
                              type="checkbox"
                              checked={selectedIssues.includes(issue)}
                              onChange={() => handleConditionChange(panel, issue)}
                              className="w-4 h-4"
                            />
                            {issue}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Photos */}
                  {selectedIssues.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-4">
                      {photosArr.map(
                        (photo, i) =>
                          photo && (
                            <img
                              key={i}
                              src={`${ServerUrl.IMAGE_URL}${photo}`}
                              alt={`${panel} photo ${i + 1}`}
                              className="w-24 h-24 object-cover rounded-md cursor-pointer"
                              onClick={() => {
                                setPreviewUrl(photo);
                                setActivePanel(panel);
                              }}
                            />
                          )
                      )}

                      {photosArr.length < photoCount && (
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <button
                            onClick={() => toggleDropdown(`${panel}-photo`)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-500 hover:bg-gray-600 text-white text-xl"
                          >
                            <AiOutlinePlus />
                          </button>

                          {showDropdown === `${panel}-photo` && (
                            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md shadow-lg z-10 w-48 p-2">
                              <label className="flex items-center px-4 py-3 w-full cursor-pointer hover:bg-gray-700">
                                <AiOutlineCamera className="mr-2" /> Take Photo
                                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileSelect(e, panel)} />
                              </label>
                              <label className="flex items-center px-4 py-3 w-full cursor-pointer hover:bg-gray-700">
                                <AiOutlineUpload className="mr-2" /> Upload Photo
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, panel)} />
                              </label>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/60" onClick={handleCancel}></div>
          <div className="relative bg-gray-900 rounded-lg p-6 w-96 text-center z-50">
            <h3 className="text-lg font-semibold mb-4">Preview Photo</h3>
            <img src={`${ServerUrl.IMAGE_URL}${previewUrl}`} alt="Preview" className="w-full h-64 object-contain rounded-md mb-4" />
            <div className="flex justify-between">
              <button onClick={handleCancel} className="px-4 py-2 bg-gray-600 rounded-md">Cancel</button>
              <button onClick={handleConfirm} className="px-4 py-2 bg-green-600 rounded-md">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RubberComponent;
