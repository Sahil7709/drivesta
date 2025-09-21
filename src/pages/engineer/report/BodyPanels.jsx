import React, { useState, useEffect, useRef } from "react";
import { AiOutlinePlus, AiOutlineCamera, AiOutlineUpload } from "react-icons/ai";
import FileUploaderService from "../../../services/upload-document.service";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";
import ServerUrl from "../../../core/constants/serverUrl.constant";

const BodyPanels = ({ data, onChange }) => {
  const photoCount = 5;

  const panels = [
    "bonnet", "bumper", "front_left_fender", "front_left_door",
    "rear_left_door", "rear_left_quarter_panel", "boot", "rear_bumper",
    "rear_right_quarter_panel", "rear_right_door", "front_right_door",
    "front_right_fender", "roof",
  ];

  const panelsWithCladding = [
    "front_left_fender", "front_left_door", "rear_left_door",
    "rear_left_quarter_panel", "rear_right_quarter_panel",
    "rear_right_door", "front_right_door", "front_right_fender",
  ];

  const labelNames = {
    bonnet: "1. Bonnet", bumper: "2. Bumper",
    front_left_fender: "3. Front Left Fender", front_left_door: "4. Front Left Door",
    rear_left_door: "5. Rear Left Door", rear_left_quarter_panel: "6. Rear Left Quarter Panel",
    boot: "7. Boot", rear_bumper: "8. Rear Bumper",
    rear_right_quarter_panel: "9. Rear Right Quarter Panel", rear_right_door: "10. Rear Right Door",
    front_right_door: "11. Front Right Door", front_right_fender: "12. Front Right Fender",
    roof: "13. Roof",
  };

  const imageKeys = panels.reduce((acc, key) => {
    acc[key] = `${key}_imageUrls`;
    if (
      key === "front_left_fender" || key === "front_right_fender" ||
      key.includes("door") || key.includes("quarter_panel") ||
      key === "roof" || key === "rear_bumper" ||
      key === "boot" || key === "bumper" || key === "bonnet"
    ) {
      acc[`${key}_cladding`] = `${key}_cladding_imageUrls`;
    }
    if (key.includes("door") && key.includes("front")) {
      acc[`${key}_orvm`] = `${key}_orvm_imageUrls`;
    }
    if (key === "boot") {
      acc[`${key}_tail_light`] = `${key}_tail_light_console_imageUrls`;
    }
    return acc;
  }, {});

  const issueOptions = [
    "Clear Coat Scratch", "Primer Scratch", "Paint Scratch", "Dent", "Swirl Marks",
    "Bleeding", "Blistering", "Boiling", "Clouding", "Cracking", "Cratering",
    "Dust Contamination", "Lifting", "Loss Of Gloss", "Orange Peel", "Poor Adhesion",
    "Poor Hiding", "Runs", "Rust", "Sanding Scratches", "Seeds", "Stone Chipping",
    "Paint Chipping", "Water Spotting", "Wrinkling", "Pin Holes",
  ];

  const [panelValues, setPanelValues] = useState({});
  const [photos, setPhotos] = useState({});
  const [showDropdown, setShowDropdown] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activePhotoKey, setActivePhotoKey] = useState(null);
  const [issueSearch, setIssueSearch] = useState({});
  const dropdownRefs = useRef({});

  // Initialize panel values and photos
  useEffect(() => {
    if (data) {
      const initialPanelValues = {};
      panels.forEach((key) => {
        initialPanelValues[key] = {
          repaint: data?.[`${key}_repaint`] || false,
          paintThickness: data?.[`${key}_paintThickness`] || "",
          issues: data?.[`${key}_issues`] || [],
          cladding: data?.[`${key}_cladding`] || false,
          cladding_issues: data?.[`${key}_cladding_issues`] || [],
        };
      });
      setPanelValues(initialPanelValues);

      const initialPhotos = {};
      Object.values(imageKeys).forEach((key) => {
        initialPhotos[key] = data?.[key] || [];
      });
      setPhotos(initialPhotos);
    }
  }, [data]);

  // Click outside dropdown handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showDropdown &&
        dropdownRefs.current[showDropdown] &&
        !dropdownRefs.current[showDropdown].contains(e.target)
      ) setShowDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const toggleDropdown = (key) =>
    setShowDropdown((curr) => (curr === key ? null : key));

  const handleInputChange = (key, field, value) => {
    const updated = { ...panelValues, [key]: { ...panelValues[key], [field]: value } };
    setPanelValues(updated);
    onChange?.(`${key}_${field}`, value);
  };

  const handleCheckboxChange = (key, field, option) => {
    const selected = panelValues[key][field] || [];
    const newSelected = selected.includes(option)
      ? selected.filter((i) => i !== option)
      : [...selected, option];
    handleInputChange(key, field, newSelected);
  };

  // Image Compression
  const compressImage = async (file) => {
    const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
    try { return await imageCompression(file, options); } catch { return file; }
  };

  const handleFileSelect = async (e, photoKey) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return toast.error("Select a valid image");

    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setActivePhotoKey(photoKey);
    setShowDropdown(null);
  };

  const handleCancel = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
    setActivePhotoKey(null);
  };

  const handleConfirm = async () => {
    if (!previewFile || !activePhotoKey) return;
    try {
      const compressedFile = await compressImage(previewFile);
      const uploaded = await FileUploaderService.uploadFileToServer(compressedFile, activePhotoKey);
      const imageUrl = uploaded.files?.[0]?.fileUrl;
      if (imageUrl) {
        const arr = photos[activePhotoKey] ? [...photos[activePhotoKey]] : [];
        arr.push(imageUrl);
        setPhotos((prev) => ({ ...prev, [activePhotoKey]: arr }));
        onChange?.(activePhotoKey, arr);
      }
    } catch {
      toast.error("Upload failed");
    } finally { handleCancel(); }
  };

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg w-full max-w-4xl text-white mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">Body Panels</h2>
      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {panels.map((panelKey) => {
          const photosArr = photos[imageKeys[panelKey]] || [];
          const { repaint, paintThickness, issues = [], cladding, cladding_issues = [] } = panelValues[panelKey] || {};

          // Filter issues for search
          const filteredIssues = issueOptions.filter((opt) =>
            opt.toLowerCase().includes((issueSearch[panelKey] || "").toLowerCase())
          );

          const filteredCladdingIssues = issueOptions.filter((opt) =>
            opt.toLowerCase().includes((issueSearch[`${panelKey}-cladding`] || "").toLowerCase())
          );

          return (
            <div key={panelKey} className="flex flex-col w-full relative border-b border-white/20 pb-4 mb-4">

              {/* Panel Header */}
              <div className="flex items-center justify-between mb-2">
                <label className="text-md font-medium">{labelNames[panelKey]}</label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={repaint || false}
                    onChange={(e) => handleInputChange(panelKey, "repaint", e.target.checked)}
                    className="w-5 h-5 text-lime-400 border-gray-300 rounded focus:ring-lime-400"
                  />
                  <span className="text-white font-medium">Repaint</span>
                </label>
              </div>

              {/* Paint Thickness */}
              <div className="mb-4">
                <label className="text-md mb-2 block">Paint Thickness</label>
                <input
                  type="number"
                  value={paintThickness || ""}
                  onChange={(e) => handleInputChange(panelKey, "paintThickness", e.target.value)}
                  className="p-2 bg-transparent border border-green-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-lime-400"
                  placeholder="Enter thickness (mm)"
                />
              </div>

              {/* Issues Dropdown */}
              <div className="mb-4 relative" ref={(el) => (dropdownRefs.current[`${panelKey}-dropdown`] = el)}>
                <label className="text-md mb-2 block">Issues</label>
                <button
                  onClick={() => toggleDropdown(`${panelKey}-dropdown`)}
                  className="p-2 bg-gray-800 border border-green-200 rounded-md w-full text-left flex justify-between items-center"
                >
                  {issues.length > 0 ? issues.join(", ") : "Select Issues"}
                  <span className="ml-2">&#9662;</span>
                </button>

                {showDropdown === `${panelKey}-dropdown` && (
                  <div className="absolute z-20 bg-gray-800 border border-green-200 rounded-md mt-1 w-full max-h-64 overflow-y-auto p-2">
                    <input
                      type="text"
                      placeholder="Search issues..."
                      value={issueSearch[panelKey] || ""}
                      onChange={(e) =>
                        setIssueSearch((prev) => ({ ...prev, [panelKey]: e.target.value }))
                      }
                      className="w-full p-2 mb-2 rounded-md bg-gray-700 text-white focus:outline-none"
                    />
                    {filteredIssues.map((opt) => (
                      <label key={opt} className="flex items-center mb-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={issues.includes(opt)}
                          onChange={() => handleCheckboxChange(panelKey, "issues", opt)}
                          className="mr-2 w-4 h-4"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Photos */}
              {issues.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-4">
                  {photosArr.map((photoUrl, i) => (
                    <div key={`${panelKey}-${i}`} className="relative">
                      <img
                        src={`${ServerUrl.IMAGE_URL}${photoUrl}`}
                        alt={`${labelNames[panelKey]} photo ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-md cursor-pointer"
                        onClick={() => {
                          setPreviewUrl(photoUrl);
                          setActivePhotoKey(imageKeys[panelKey]);
                        }}
                      />
                    </div>
                  ))}

                  {photosArr.length < photoCount && (
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <button
                        onClick={() => toggleDropdown(`${panelKey}-photo`)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-500 text-white text-2xl hover:bg-gray-600"
                      >
                        <AiOutlinePlus />
                      </button>

                      {showDropdown === `${panelKey}-photo` && (
                        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md shadow-lg z-10 w-48">
                          <label className="flex items-center px-4 py-3 w-full cursor-pointer hover:bg-gray-700">
                            <AiOutlineCamera className="mr-2" /> Take Photo
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => handleFileSelect(e, imageKeys[panelKey])}
                            />
                          </label>
                          <label className="flex items-center px-4 py-3 w-full cursor-pointer hover:bg-gray-700">
                            <AiOutlineUpload className="mr-2" /> Upload Photo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileSelect(e, imageKeys[panelKey])}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Cladding */}
              {panelsWithCladding.includes(panelKey) && (
                <div className="mb-4 mt-4" ref={(el) => (dropdownRefs.current[`${panelKey}-cladding-dropdown`] = el)}>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cladding ?? false}
                      onChange={(e) => handleInputChange(panelKey, "cladding", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-lime-300 dark:peer-focus:ring-lime-800 dark:bg-gray-700 peer-checked:bg-lime-600 transition-all"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                    <span className="ml-3 text-white font-medium">Cladding</span>
                  </label>

                  {cladding && (
                    <>
                      <label className="text-md mb-2 block mt-2">Cladding Issues</label>
                      <button
                        onClick={() => toggleDropdown(`${panelKey}-cladding-dropdown`)}
                        className="p-2 bg-gray-800 border border-green-200 rounded-md w-full text-left flex justify-between items-center"
                      >
                        {cladding_issues.length > 0 ? cladding_issues.join(", ") : "Select Cladding Issues"}
                        <span className="ml-2">&#9662;</span>
                      </button>
                      {showDropdown === `${panelKey}-cladding-dropdown` && (
                        <div className="absolute z-20 bg-gray-800 border border-green-200 rounded-md mt-1 w-full max-h-64 overflow-y-auto p-2">
                          <input
                            type="text"
                            placeholder="Search cladding issues..."
                            value={issueSearch[`${panelKey}-cladding`] || ""}
                            onChange={(e) =>
                              setIssueSearch((prev) => ({ ...prev, [`${panelKey}-cladding`]: e.target.value }))
                            }
                            className="w-full p-2 mb-2 rounded-md bg-gray-700 text-white focus:outline-none"
                          />
                          {filteredCladdingIssues.map((opt) => (
                            <label key={opt} className="flex items-center mb-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cladding_issues.includes(opt)}
                                onChange={() => handleCheckboxChange(panelKey, "cladding_issues", opt)}
                                className="mr-2 w-4 h-4"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
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

export default BodyPanels;
