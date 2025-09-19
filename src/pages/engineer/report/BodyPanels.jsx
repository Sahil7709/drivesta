import React, { useState, useEffect, useRef } from "react";
import {
  AiOutlinePlus,
  AiOutlineCamera,
  AiOutlineUpload,
} from "react-icons/ai";
import FullScreenPhotoViewer from "../report/FullScreenPhotoViewer";
import FileUploaderService from "../../../services/upload-document.service";
import { toast } from "react-toastify";

const BodyPanels = ({ data, onChange }) => {
  const photoCount = 5;

  const panels = [
    "bonnet",
    "bumper",
    "front_left_fender",
    "front_left_door",
    "rear_left_door",
    "rear_left_quarter_panel",
    "boot",
    "rear_bumper",
    "rear_right_quarter_panel",
    "rear_right_door",
    "front_right_door",
    "front_right_fender",
    "roof",
  ];

  const panelsWithCladding = [
    "front_left_fender",
    "front_left_door",
    "rear_left_door",
    "rear_left_quarter_panel",
    "rear_right_quarter_panel",
    "rear_right_door",
    "front_right_door",
    "front_right_fender",
  ];


  const labelNames = {
    bonnet: "1. Bonnet",
    bumper: "2. Bumper",
    front_left_fender: "3. Front Left Fender",
    front_left_door: "4. Front Left Door",
    rear_left_door: "5. Rear Left Door",
    rear_left_quarter_panel: "6. Rear Left Quarter Panel",
    boot: "7. Boot",
    rear_bumper: "8. Rear Bumper",
    rear_right_quarter_panel: "9. Rear Right Quarter Panel",
    rear_right_door: "10. Rear Right Door",
    front_right_door: "11. Front Right Door",
    front_right_fender: "12. Front Right Fender",
    roof: "13. Roof",
  };

  const imageKeys = panels.reduce((acc, key) => {
    acc[key] = `${key}_imageUrls`;
    if (
      key === "front_left_fender" ||
      key === "front_right_fender" ||
      key.includes("door") ||
      key.includes("quarter_panel") ||
      key === "roof" ||              // add these
      key === "rear_bumper" ||
      key === "boot" ||
      key === "bumper" ||
      key === "bonnet"
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
    "Clear Coat Scratch",
    "Primer Scratch",
    "Paint Scratch",
    "Dent",
    "Swirl Marks",
    "Bleeding",
    "Blistering",
    "Boiling",
    "Clouding",
    "Cracking",
    "Cratering",
    "Dust Contamination",
    "Lifting",
    "Loss Of Gloss",
    "Orange Peel",
    "Poor Adhesion",
    "Poor Hiding",
    "Runs",
    "Rust",
    "Sanding Scratches",
    "Seeds",
    "Stone Chipping",
    "Paint Chipping",
    "Water Spotting",
    "Wrinkling",
    "Pin Holes",
  ];

  const [panelValues, setPanelValues] = useState({});
  const [photos, setPhotos] = useState({});
  const [showDropdown, setShowDropdown] = useState(null);
  const [showPhoto, setShowPhoto] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState({});
  const [streamStates, setStreamStates] = useState({});

  const dropdownRefs = useRef({}); // ✅ track each dropdown
  const videoRefs = useRef({});

  // useEffect(() => {
  //   const initialPanelValues = {};
  //   panels.forEach((key) => {
  //     initialPanelValues[key] = {
  //       repaint: data?.[`${key}_repaint`] || false,
  //       paintThickness: data?.[`${key}_paintThickness`] || "",
  //       issues: data?.[`${key}_issues`] || [],
  //       cladding: data?.[`${key}_cladding`] || false,
  //       cladding_issues: data?.[`${key}_cladding_issues`] || [],
  //     };
  //   });
  //   setPanelValues(initialPanelValues);

  //   const initialPhotos = {};
  //   Object.values(imageKeys).forEach((key) => {
  //     initialPhotos[key] = data?.[key] || [];
  //   });
  //   setPhotos(initialPhotos);
  // }, [data]);

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && data) {
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

      setInitialized(true);
    }
  }, [data, initialized]);


  // ✅ close dropdown if clicked outside
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

  const handleInputChange = (key, field, value) => {
    setPanelValues((prev) => {
      const newValues = { ...prev, [key]: { ...prev[key], [field]: value } };
      if (onChange) onChange(`${key}_${field}`, value);
      return newValues;
    });
  };

  const handleCheckboxChange = (key, field, option) => {
    const selected = panelValues[key][field] || [];
    const newSelected = selected.includes(option)
      ? selected.filter((i) => i !== option)
      : [...selected, option];
    handleInputChange(key, field, newSelected);
  };

  const handleFileUpload = async (e, photoKey) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/"))
      return toast.error("Select a valid image file");

    const arr = photos[photoKey] ? [...photos[photoKey]] : [];
    if (arr.length >= photoCount)
      return toast.error(`Maximum ${photoCount} photos allowed`);

    try {
      const uploaded = await FileUploaderService.uploadFileToServer(
        file,
        photoKey
      );
      const imageUrl = uploaded.files?.[0]?.fileUrl || null;
      if (imageUrl) {
        arr.push(imageUrl);
        setPhotos((prev) => ({ ...prev, [photoKey]: arr }));
        if (onChange) onChange(photoKey, arr);
        setShowDropdown(null);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to upload image");
    }
  };

  // Open camera on first click, capture on second click
  const handleCameraClick = async (photoKey) => {
    const arr = photos[photoKey] ? [...photos[photoKey]] : [];
    if (arr.length >= photoCount) {
      return toast.error(`Maximum ${photoCount} photos allowed`);
    }

    const slotKey = `${photoKey}-${arr.length}`;

    if (!isCameraActive[slotKey]) {
      // 👉 First click: open camera preview
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRefs.current[slotKey]) {
          videoRefs.current[slotKey].srcObject = stream;
        }
        setStreamStates((prev) => ({ ...prev, [slotKey]: stream }));
        setIsCameraActive((prev) => ({ ...prev, [slotKey]: true }));
      } catch {
        toast.error("Camera not available");
      }
    } else {
      // 👉 Second click: capture photo
      const video = videoRefs.current[slotKey];
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            const file = new File([blob], `${slotKey}.png`, {
              type: "image/png",
            });
            const uploaded = await FileUploaderService.uploadFileToServer(
              file,
              photoKey
            );
            const imageUrl = uploaded.files?.[0]?.fileUrl || null;

            if (imageUrl) {
              arr.push(imageUrl);
              setPhotos((prev) => ({ ...prev, [photoKey]: arr }));
              if (onChange) onChange(photoKey, arr);
            }
          } catch (err) {
            console.error("Upload failed:", err);
            toast.error("Failed to upload image");
          }
        }
      }, "image/png");

      // 👉 Stop camera after capture
      const stream = streamStates[slotKey];
      if (stream) stream.getTracks().forEach((t) => t.stop());

      setStreamStates((prev) => ({ ...prev, [slotKey]: null }));
      setIsCameraActive((prev) => ({ ...prev, [slotKey]: false }));
      setShowDropdown(null);
    }
  };

  const toggleDropdown = (slotKey) =>
    setShowDropdown((curr) => (curr === slotKey ? null : slotKey));

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg w-full max-w-4xl text-white mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">
        Body Panels
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {panels.map((panelKey) => {
          const photosArr = photos[imageKeys[panelKey]] || [];
          const {
            repaint,
            paintThickness,
            issues = [],
            cladding,
            cladding_issues = [],
          } = panelValues[panelKey] || {};
          const nextSlotKey = `${panelKey}-dropdown`;

          return (
            <div
              key={panelKey}
              className="flex flex-col w-full relative border-b border-white/20 pb-4 mb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-md font-medium">
                  {labelNames[panelKey]}
                </label>

                {panelKey && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={repaint || false}
                      onChange={e => handleInputChange(panelKey, "repaint", e.target.checked)}
                      className="w-5 h-5 text-lime-400 border-gray-300 rounded focus:ring-lime-400"
                    />
                    <span className="text-white font-medium">Repaint</span>
                  </label>
                )}
              </div>

              {/* Paint Thickness */}
              <div className="mb-4">
                <label className="text-md mb-2 block">Paint Thickness</label>
                <input
                  type="number"
                  value={paintThickness || ""}
                  onChange={(e) =>
                    handleInputChange(
                      panelKey,
                      "paintThickness",
                      e.target.value
                    )
                  }
                  className="p-2 bg-transparent border border-green-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-lime-400"
                  placeholder="Enter thickness (mm)"
                />
              </div>

              {/* Issues */}
              <div
                className="mb-4 relative"
                ref={(el) => (dropdownRefs.current[nextSlotKey] = el)}
              >
                <label className="text-md mb-2 block">Issues</label>
                <button
                  onClick={() => toggleDropdown(nextSlotKey)}
                  className="p-2 bg-gray-800 border border-green-200 rounded-md w-full text-left flex justify-between items-center"
                >
                  {issues.length > 0 ? issues.join(", ") : "Select Issues"}
                  <span className="ml-2">&#9662;</span>
                </button>
                {showDropdown === nextSlotKey && (
                  <div className="absolute z-20 bg-gray-800 border border-green-200 rounded-md mt-1 w-full max-h-64 overflow-y-auto p-2">
                    {issueOptions.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center mb-1 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={issues.includes(opt)}
                          onChange={() =>
                            handleCheckboxChange(panelKey, "issues", opt)
                          }
                          className="mr-2 w-4 h-4"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
              </div>


              {/* Photos */}
              {issues.length > 0 && ( // ✅ show photos only if at least one issue selected
                <div className="mt-2 flex flex-wrap gap-4">
                  {photosArr.map((photoUrl, i) => (
                    <div key={`${panelKey}-${i}`} className="relative">
                      <img
                        src={photoUrl}
                        alt={`${labelNames[panelKey]} photo ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-md cursor-pointer"
                        onClick={() => setShowPhoto(photoUrl)}
                      />
                    </div>
                  ))}
                  <video
                    ref={(el) =>
                    (videoRefs.current[
                      `${imageKeys[panelKey]}-${photosArr.length}`
                    ] = el)
                    }
                    autoPlay
                    className={
                      isCameraActive[
                        `${imageKeys[panelKey]}-${photosArr.length}`
                      ]
                        ? "w-24 h-24 rounded-md mt-2"
                        : "hidden"
                    }
                  />

                  {photosArr.length < photoCount && (
                    <div
                      className="relative w-24 h-24 flex items-center justify-center"
                      ref={(el) =>
                        (dropdownRefs.current[`${panelKey}-photo`] = el)
                      }
                    >
                      <button
                        onClick={() => toggleDropdown(`${panelKey}-photo`)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-500 text-white text-2xl hover:bg-gray-600"
                      >
                        <AiOutlinePlus />
                      </button>

                      {showDropdown === `${panelKey}-photo` && (
                        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md shadow-lg z-10 w-48">
                          <button
                            onClick={() =>
                              handleCameraClick(imageKeys[panelKey])
                            }
                            className="flex items-center px-4 py-3 w-full text-left hover:bg-gray-700"
                          >
                            <AiOutlineCamera className="mr-2" />
                            {isCameraActive[
                              `${imageKeys[panelKey]}-${photosArr.length}`
                            ]
                              ? "Capture Photo"
                              : "Take Photo"}
                          </button>
                          <label className="flex items-center px-4 py-3 w-full hover:bg-gray-700 cursor-pointer">
                            <AiOutlineUpload className="mr-2" /> Upload Photo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload(e, imageKeys[panelKey])
                              }
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Cladding Issues Section */}

              {panelsWithCladding.includes(panelKey) && (
                <div className="mb-4 mt-4"     
                ref={(el) => (dropdownRefs.current[`${panelKey}-cladding-dropdown`] = el)}
      >
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={panelValues[panelKey]?.cladding ?? false}
                      onChange={e =>
                        handleInputChange(panelKey, "cladding", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-lime-300 dark:peer-focus:ring-lime-800 dark:bg-gray-700 peer-checked:bg-lime-600 transition-all"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                    <span className="ml-3 text-white font-medium">Cladding</span>
                  </label>
                  {panelValues[panelKey]?.cladding && (
                    <>
                      <label className="text-md mb-2 block">Cladding Issues</label>
                      <button
                        onClick={() => toggleDropdown(`${panelKey}-cladding-dropdown`)}
                        className="p-2 bg-gray-800 border border-green-200 rounded-md w-full text-left flex justify-between items-center"
                      >
                        {panelValues[panelKey].cladding_issues.length > 0
                          ? panelValues[panelKey].cladding_issues.join(", ")
                          : "Select Cladding Issues"}
                        <span className="ml-2">&#9662;</span>
                      </button>
                      {showDropdown === `${panelKey}-cladding-dropdown` && (
                        <div className="absolute z-20 bg-gray-800 border border-green-200 rounded-md mt-1 w-full max-h-64 overflow-y-auto p-2">
                          {issueOptions.map((opt) => (
                            <label key={opt} className="flex items-center mb-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={panelValues[panelKey].cladding_issues.includes(opt)}
                                onChange={() =>
                                  handleCheckboxChange(panelKey, "cladding_issues", opt)
                                }
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

      {showPhoto && (
        <FullScreenPhotoViewer
          photo={showPhoto}
          onClose={() => setShowPhoto(null)}
        />
      )}
    </div>
  );
};

export default BodyPanels;