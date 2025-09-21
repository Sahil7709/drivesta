import React, { useState, useEffect, useRef } from "react";
import {
  AiOutlinePlus,
  AiOutlineCamera,
  AiOutlineUpload,
} from "react-icons/ai";
import FileUploaderService from "../../../services/upload-document.service";
import ServerUrl from "../../../core/constants/serverUrl.constant";
import ToggleButton from "../report/ToggleButton";
import imageCompression from "browser-image-compression";

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
  const [condition, setCondition] = useState(() => {
    const init = {};
    rubberPanels.forEach((panel) => {
      const existing = data?.[`${panel}_issues`];
      init[panel] = Array.isArray(existing)
        ? existing
        : existing
        ? [existing]
        : [];
    });
    return init;
  });

  const [issueSearch, setIssueSearch] = useState(() => {
    const init = {};
    rubberPanels.forEach((panel) => (init[panel] = ""));
    return init;
  });

  const [photos, setPhotos] = useState(() => {
    const init = {};
    rubberPanels.forEach((panel) => {
      const imgs = Array.isArray(data?.[`${panel}_imageUrls`])
        ? data[`${panel}_imageUrls`]
        : [];
      init[panel] = [
        ...imgs,
        ...Array(photoCount - imgs.length).fill(null),
      ].slice(0, photoCount);
    });
    return init;
  });

  const [rearWiperEnabled, setRearWiperEnabled] = useState(
    data?.rubber_rear_wiper_toggle || false
  );

  const [sunroofEnabled, setSunroofEnabled] = useState(
    data?.rubber_sunroof_toggle || false
  );

  const [showDropdown, setShowDropdown] = useState(null);
  const [showIssueDropdown, setShowIssueDropdown] = useState(null);

  // Preview modal
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeLabel, setActiveLabel] = useState(null);

  const issueDropdownRefs = useRef({});

  // Close issue dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showIssueDropdown) {
        const dropdownEl = issueDropdownRefs.current[showIssueDropdown];
        if (dropdownEl && !dropdownEl.contains(event.target)) {
          setShowIssueDropdown(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showIssueDropdown]);

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

  const handleConditionChange = (panel, issue) => {
    setCondition((prev) => {
      const current = prev[panel] || [];
      const updated = current.includes(issue)
        ? current.filter((i) => i !== issue)
        : [...current, issue];
      onChange && onChange(`${panel}_issues`, updated);
      return { ...prev, [panel]: updated };
    });
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
    } catch (err) {
      console.warn("Image compression failed, uploading original", err);
      return file;
    }
  };

  const handleFileSelect = async (e, panel, idx) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/"))
      return alert("Please select a valid image file.");

    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setActiveLabel({ panel, idx });
    setShowDropdown(null);
  };

  const handleCancel = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
    setActiveLabel(null);
  };

  const handleConfirm = async () => {
    if (!previewFile || !activeLabel) return;
    const { panel, idx } = activeLabel;

    try {
      const compressedFile = await compressImage(previewFile);
      const uploadedData = await FileUploaderService.uploadFileToServer(
        compressedFile,
        panel
      );
      const imageUrl = uploadedData?.files?.[0]?.fileUrl || null;

      if (imageUrl) {
        setPhotos((prev) => {
          const updated = [...prev[panel]];
          updated[idx] = imageUrl;
          onChange && onChange(`${panel}_imageUrls`, updated);
          return { ...prev, [panel]: updated };
        });
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      handleCancel();
    }
  };

  const handlePlusClick = (panel, idx) => {
    setShowDropdown(`${panel}-${idx}`);
  };

  const capitalizeFirstWord = (str) => {
    if (!str) return str;
    const words = str.trim().split(" ");
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(" ");
  };

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">
        Rubber Components
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {rubberPanels.map((panel, idx) => (
          <div key={panel} className="flex flex-col w-full relative">
            <div className="flex justify-between items-center mb-2">
              <label className="text-md text-white font-medium text-left">
                {`${idx + 1}. ${
                  labelNames[panel] ||
                  capitalizeFirstWord(panel.replace(/_/g, " "))
                }`}
              </label>
              {panel === "rubber_rear_wiper" && (
                <ToggleButton
                  checked={rearWiperEnabled}
                  onChange={toggleRearWiper}
                />
              )}
              {panel === "rubber_sunroof" && (
                <ToggleButton
                  checked={sunroofEnabled}
                  onChange={toggleSunroof}
                />
              )}
            </div>

            {(panel !== "rubber_rear_wiper" || rearWiperEnabled) &&
              (panel !== "rubber_sunroof" || sunroofEnabled) && (
                <>
                  <div
                    className="mb-4 relative"
                    ref={(el) => (issueDropdownRefs.current[panel] = el)}
                  >
                    <label className="text-md text-white font-medium text-left mb-2">
                      Issues
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setShowIssueDropdown((prev) =>
                          prev === panel ? null : panel
                        )
                      }
                      className="w-full bg-gray-800 text-white p-2 rounded-md flex justify-between items-center focus:outline-none"
                    >
                      {condition[panel]?.length > 0
                        ? condition[panel].join(", ")
                        : "Select Issues"}
                      <span className="ml-2">&#9662;</span>
                    </button>

                    {showIssueDropdown === panel && (
                      <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-white/20 rounded-md shadow-lg max-h-48 overflow-auto p-2">
                        <input
                          type="text"
                          placeholder="Search issues..."
                          value={issueSearch[panel] || ""}
                          onChange={(e) =>
                            setIssueSearch((prev) => ({
                              ...prev,
                              [panel]: e.target.value,
                            }))
                          }
                          className="w-full p-2 mb-2 rounded-md bg-gray-700 text-white focus:outline-none"
                        />
                        {getIssueOptions(panel)
                          .filter((opt) =>
                            opt
                              .toLowerCase()
                              .includes(
                                (issueSearch[panel] || "").toLowerCase()
                              )
                          )
                          .map((issue) => (
                            <label
                              key={issue}
                              className="flex items-center gap-2 px-2 py-1 cursor-pointer text-white hover:bg-gray-700 rounded-md"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  condition[panel]?.includes(issue) || false
                                }
                                onChange={() =>
                                  handleConditionChange(panel, issue)
                                }
                                className="w-4 h-4"
                              />
                              {issue}
                            </label>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Photos */}
                  {condition[panel]?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-4 justify-left items-center relative">
                      {photos[panel].map((photo, i) => {
                        // Only show plus button for the first empty slot
                        const isFirstEmpty =
                          !photo && !photos[panel].slice(0, i).includes(null);

                        return photo ? (
                          <img
                            key={i}
                            src={`${ServerUrl.IMAGE_URL}${photo}`}
                            alt={`${panel} photo ${i + 1}`}
                            className="w-24 h-24 object-cover rounded-md cursor-pointer"
                            onClick={() => setPreviewUrl(photo)}
                          />
                        ) : (
                          isFirstEmpty && (
                            <div
                              key={i}
                              className="relative w-24 h-24 flex items-center justify-center"
                            >
                              <button
                                onClick={() => handlePlusClick(panel, i)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-500 hover:bg-gray-600 text-white text-xl"
                              >
                                <AiOutlinePlus />
                              </button>

                              {showDropdown === `${panel}-${i}` && (
                                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md shadow-lg z-10 w-48">
                                  <label className="flex items-center px-4 py-3 text-sm text-white hover:bg-gray-700 cursor-pointer w-full">
                                    <AiOutlineCamera className="mr-2" /> Take
                                    Photo
                                    <input
                                      type="file"
                                      accept="image/*"
                                      capture="environment"
                                      className="hidden"
                                      onChange={(e) =>
                                        handleFileSelect(e, panel, i)
                                      }
                                    />
                                  </label>
                                  <label className="flex items-center px-4 py-3 text-sm text-white hover:bg-gray-700 cursor-pointer w-full">
                                    <AiOutlineUpload className="mr-2" /> Upload
                                    Photo
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) =>
                                        handleFileSelect(e, panel, i)
                                      }
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          )
                        );
                      })}
                    </div>
                  )}
                </>
              )}
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-96 text-center">
            <h3 className="text-lg font-semibold mb-4">Preview Photo</h3>
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-contain rounded-md mb-4"
            />
            <div className="flex justify-between">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-500"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RubberComponent;
