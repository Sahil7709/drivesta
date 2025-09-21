import React, { useState, useEffect, useRef } from "react";
import {
  AiOutlinePlus,
  AiOutlineCamera,
  AiOutlineUpload,
} from "react-icons/ai";
import FileUploaderService from "../../../services/upload-document.service";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";
import ServerUrl from "../../../core/constants/serverUrl.constant";
import ToggleButton from "./ToggleButton";

const glassPanels = [
  "front_windshield",
  "front_left_door_glass",
  "left_side_orvm",
  "rear_left_door_glass",
  "rear_left_quarter_glass",
  "rear_windshield",
  "rear_right_quarter_glass",
  "rear_right_door_glass",
  "front_right_door_glass",
  "right_side_orvm",
  "sunroof_glass",
];

const labelNames = {
  front_windshield: "1. Front Windshield",
  front_left_door_glass: "2. Front Left Door Glass",
  left_side_orvm: "3. Left Side ORVM",
  rear_left_door_glass: "4. Rear Left Door Glass",
  rear_left_quarter_glass: "5. Rear Left Quarter Glass",
  rear_windshield: "6. Rear Windshield",
  rear_right_quarter_glass: "7. Rear Right Quarter Glass",
  rear_right_door_glass: "8. Rear Right Door Glass",
  front_right_door_glass: "9. Front Right Door Glass",
  right_side_orvm: "10. Right Side ORVM",
  sunroof_glass: "11. Sunroof Glass",
};

const specialGlassPanels = new Set([
  "front_windshield",
  "front_left_door_glass",
  "rear_left_door_glass",
  "rear_left_quarter_glass",
  "rear_windshield",
  "rear_right_quarter_glass",
  "rear_right_door_glass",
  "front_right_door_glass",
  "sunroof_glass",
]);

const brandOptions = [
  "ASAHI GLASS(AIS)",
  "FUYAO GLASS",
  "NIPPON",
  "PILKINGTON",
  "SPLINTEX",
  "KAC",
  "CARLEX",
  "GUARDIAN",
  "SAINT GOBAIN",
  "MAGNA",
  "AGC",
  "SCHOTT",
  "XINYI GLASS",
  "GENTEX",
  "TEMPERLITE",
  "LAMISAFE",
  "OTHER",
];

const glassIssueOptions = ["Fitting Mismatch", "Scratch", "Crack"];

const photoCountForPanel = (panel) => (specialGlassPanels.has(panel) ? 5 : 1);

const Glasses = ({ data = {}, onChange }) => {
  const [photos, setPhotos] = useState({});
  const [brand, setBrand] = useState({});
  const [manufacturingDate, setManufacturingDate] = useState({});
  const [panelIssues, setPanelIssues] = useState({});
  const [showDropdown, setShowDropdown] = useState(null);
  const [issueSearch, setIssueSearch] = useState({});
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [sunroofEnabled, setSunroofEnabled] = useState(
    data?.sunroof_glass_toggle || false
  );

  const dropdownRefs = useRef({});

  useEffect(() => {
    const initPhotos = {};
    const initBrand = {};
    const initManufacturingDate = {};
    const initIssues = {};
    glassPanels.forEach((panel) => {
      const maxPhotos = photoCountForPanel(panel);
      initPhotos[panel] = Array.isArray(data[`${panel}_imageUrls`])
        ? data[`${panel}_imageUrls`].slice(0, maxPhotos)
        : [];
      initBrand[panel] = data[`${panel}_brand`] || "";
      initManufacturingDate[panel] = data[`${panel}_manufacturingDate`] || "";
      initIssues[panel] = Array.isArray(data[`${panel}_issues`])
        ? data[`${panel}_issues`]
        : data[`${panel}_issues`]
        ? [data[`${panel}_issues`]]
        : [];
    });
    setPhotos(initPhotos);
    setBrand(initBrand);
    setManufacturingDate(initManufacturingDate);
    setPanelIssues(initIssues);
  }, [data]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showDropdown &&
        dropdownRefs.current[showDropdown] &&
        !dropdownRefs.current[showDropdown].contains(e.target)
      ) {
        setShowDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const toggleDropdown = (panel) =>
    setShowDropdown((curr) => (curr === panel ? null : panel));

  const handleInputChange = (setter, panel, field) => (e) => {
    const value = e.target.value;
    setter((prev) => {
      const updated = { ...prev, [panel]: value };
      onChange && onChange(`${panel}_${field}`, value);
      return updated;
    });
  };

  const toggleSunroof = () => {
    const newVal = !sunroofEnabled;
    setSunroofEnabled(newVal);
    onChange && onChange("sunroof_glass_toggle", newVal);
  };

  const handleBrandChange = (panel) => (e) => {
    const value = e.target.value;
    setBrand((prev) => {
      const updated = { ...prev, [panel]: value };
      onChange && onChange(`${panel}_brand`, value);
      return updated;
    });
  };

  const handleIssueChange = (panel, issue) => {
    setPanelIssues((prev) => {
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
    } catch {
      return file;
    }
  };

  const handleFileSelect = async (e, panel) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/"))
      return toast.error("Select a valid image");
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
      const uploaded = await FileUploaderService.uploadFileToServer(
        compressed,
        activePanel
      );
      const imageUrl = uploaded.files?.[0]?.fileUrl;
      if (!imageUrl) throw new Error("Upload failed");

      setPhotos((prev) => {
        const arr = prev[activePanel]
          ? [...prev[activePanel], imageUrl]
          : [imageUrl];
        onChange && onChange(`${activePanel}_imageUrls`, arr);
        return { ...prev, [activePanel]: arr };
      });
    } catch {
      toast.error("Upload failed");
    } finally {
      handleCancel();
    }
  };

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">
        Glass Panels
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {glassPanels.map((panel) => {
          const photosArr = photos[panel] || [];
          const selectedIssues = panelIssues[panel] || [];
          const isSpecial = specialGlassPanels.has(panel);
          const filteredIssues = glassIssueOptions.filter((i) =>
            i.toLowerCase().includes((issueSearch[panel] || "").toLowerCase())
          );

          const showIssuesAndPhotos =
            panel !== "sunroof_glass" || sunroofEnabled;

          return (
            <div
              key={panel}
              className="flex flex-col w-full relative border-b border-white/20 pb-4 mb-4"
            >
              {/* Sunroof Panel */}
              <div className="flex items-center justify-between mb-2">
                <label className="text-md text-white font-medium">
                  {labelNames[panel]}
                </label>
                {panel === "sunroof_glass" && (
                  <ToggleButton checked={sunroofEnabled} onChange={toggleSunroof} />
                )}
              </div>

              {/* Show Sunroof details only if toggle is ON */}
              {(panel !== "sunroof_glass" || sunroofEnabled) && (
                <>
                  {/* Brand Selection */}
                  {isSpecial && (
                    <div
                      className="mb-4 relative"
                      ref={(el) => (dropdownRefs.current[`${panel}-brand`] = el)}
                    >
                      <label className="text-md text-white font-medium mb-2">
                        Brand
                      </label>
                      <button
                        onClick={() => toggleDropdown(`${panel}-brand`)}
                        className="p-2 bg-gray-800 border border-green-200 rounded-md w-full text-left flex justify-between items-center text-white"
                      >
                        {brand[panel] || "Select Brand"}
                        <span className="ml-2">&#9662;</span>
                      </button>
                      {showDropdown === `${panel}-brand` && (
                        <div className="absolute z-20 bg-gray-800 border border-green-200 rounded-md mt-1 w-full max-h-64 overflow-y-auto p-2">
                          <input
                            type="text"
                            value={issueSearch[`${panel}-brand`] || ""}
                            onChange={(e) =>
                              setIssueSearch((prev) => ({
                                ...prev,
                                [`${panel}-brand`]: e.target.value,
                              }))
                            }
                            placeholder="Search brand..."
                            className="w-full p-2 mb-2 rounded-md bg-gray-700 text-white focus:outline-none"
                          />
                          {brandOptions
                            .filter((b) =>
                              b
                                .toLowerCase()
                                .includes(
                                  (
                                    issueSearch[`${panel}-brand`] || ""
                                  ).toLowerCase()
                                )
                            )
                            .map((b) => (
                              <div
                                key={b}
                                className="px-2 py-1 cursor-pointer hover:bg-gray-700 rounded-md text-white"
                                onClick={() => {
                                  handleBrandChange(panel)({
                                    target: { value: b },
                                  });
                                  setShowDropdown(null);
                                }}
                              >
                                {b}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                  {isSpecial && (
                    <div className="mb-4">
                      <label className="text-md text-white font-medium mb-2">
                        Manufacturing MM/YY
                      </label>
                      <input
                        type="text"
                        value={manufacturingDate[panel] || ""}
                        onChange={(e) => {
                          // Allow only numbers and /
                          let value = e.target.value.replace(/[^0-9/]/g, "");
                          // Auto-insert / after MM
                          if (value.length === 2 && !value.includes("/"))
                            value += "/";
                          if (value.length > 5) value = value.slice(0, 5);
                          setManufacturingDate((prev) => {
                            const updated = { ...prev, [panel]: value };
                            onChange &&
                              onChange(`${panel}_manufacturingDate`, value);
                            return updated;
                          });
                        }}
                        placeholder="MM/YY"
                        className="p-2 bg-transparent text-white border border-green-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-lime-400"
                      />
                    </div>
                  )}
                  {/* Issues Dropdown */}
                  {showIssuesAndPhotos && (
                    <div
                      className="mb-4 relative"
                      ref={(el) => (dropdownRefs.current[panel] = el)}
                    >
                      <button
                        onClick={() => toggleDropdown(panel)}
                        className="p-2 bg-gray-800 border border-green-200 rounded-md w-full text-left flex justify-between items-center text-white"
                      >
                        {selectedIssues.length > 0
                          ? selectedIssues.join(", ")
                          : "Select Issues"}
                        <span className="ml-2">&#9662;</span>
                      </button>
                      {showDropdown === panel && (
                        <div className="absolute z-20 bg-gray-800 border border-green-200 rounded-md mt-1 w-full max-h-64 overflow-y-auto p-2">
                          <input
                            type="text"
                            value={issueSearch[panel] || ""}
                            onChange={(e) =>
                              setIssueSearch((prev) => ({
                                ...prev,
                                [panel]: e.target.value,
                              }))
                            }
                            placeholder="Search issues..."
                            className="w-full p-2 mb-2 rounded-md bg-gray-700 text-white focus:outline-none"
                          />
                          {filteredIssues.map((issue) => (
                            <label
                              key={issue}
                              className="flex items-center mb-1 cursor-pointer text-white"
                            >
                              <input
                                type="checkbox"
                                checked={selectedIssues.includes(issue)}
                                onChange={() => handleIssueChange(panel, issue)}
                                className="mr-2 w-4 h-4"
                              />
                              {issue}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Photos */}
                  {showIssuesAndPhotos && selectedIssues.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-4">
                      {photosArr.map((photoUrl, i) => (
                        <div key={i} className="relative">
                          <img
                            src={`${ServerUrl.IMAGE_URL}${photoUrl}`}
                            alt={`${labelNames[panel]} photo ${i + 1}`}
                            className="w-24 h-24 object-cover rounded-md cursor-pointer"
                            onClick={() => {
                              setPreviewUrl(photoUrl);
                              setActivePanel(panel);
                            }}
                          />
                        </div>
                      ))}

                      {photosArr.length < photoCountForPanel(panel) && (
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <button
                            onClick={() => toggleDropdown(`${panel}-photo`)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-500 text-white text-2xl hover:bg-gray-600"
                          >
                            <AiOutlinePlus />
                          </button>

                          {showDropdown === `${panel}-photo` && (
                            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md shadow-lg z-10 w-48 p-2">
                              <label className="flex items-center px-4 py-3 w-full cursor-pointer hover:bg-gray-700">
                                <AiOutlineCamera className="mr-2" /> Take Photo
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={(e) => handleFileSelect(e, panel)}
                                />
                              </label>
                              <label className="flex items-center px-4 py-3 w-full cursor-pointer hover:bg-gray-700">
                                <AiOutlineUpload className="mr-2" /> Upload Photo
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileSelect(e, panel)}
                                />
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
          <div
            className="fixed inset-0 bg-black/60"
            onClick={handleCancel}
          ></div>
          <div className="relative bg-gray-900 rounded-lg p-6 w-96 text-center z-60">
            <h3 className="text-lg font-semibold mb-4">Preview Photo</h3>
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-contain rounded-md mb-4"
            />
            <div className="flex justify-between">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-green-600 rounded-md"
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

export default Glasses;
