import React, { useState, useEffect } from "react";
import { AiOutlinePlus, AiOutlineCamera, AiOutlineUpload } from "react-icons/ai";
import FullScreenPhotoViewer from "../report/FullScreenPhotoViewer";
import FileUploaderService from "../../../services/upload-document.service";

const BodyPanels = ({ data, onChange }) => {
  const photoCount = 5;

  const panels = [
    "bonnet", "bumper", "front_left_fender", "front_left_door", "rear_left_door",
    "rear_left_quarter_panel", "boot", "rear_bumper", "rear_right_quarter_panel",
    "rear_right_door", "front_right_door", "front_right_fender", "roof"
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
    roof: "13. Roof"
  };

  const imageKeys = panels.reduce((acc, key) => {
    acc[key] = `${key}_imageUrls`;
    if (key === "front_left_fender" || key === "front_right_fender" || key.includes("door") || key.includes("quarter_panel")) {
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
    "Clear Coat Scratch","Primer Scratch","Paint Scratch","Dent","Swirl Marks",
    "Bleeding","Blistering","Boiling","Clouding","Cracking","Cratering",
    "Dust Contamination","Lifting","Loss Of Gloss","Orange Peel","Poor Adhesion",
    "Poor Hiding","Runs","Rust","Sanding Scratches","Seeds","Stone Chipping",
    "Paint Chipping","Water Spotting","Wrinkling","Pin Holes"
  ];

  const [panelValues, setPanelValues] = useState({});
  const [photos, setPhotos] = useState({});
  const [showDropdown, setShowDropdown] = useState(null);
  const [showPhoto, setShowPhoto] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState({});
  const [streamStates, setStreamStates] = useState({});

  useEffect(() => {
    // Initialize panel values
    const initialPanelValues = {};
    panels.forEach(key => {
      initialPanelValues[key] = {
        repaint: data?.[`${key}_repaint`] || false,
        paintThickness: data?.[`${key}_paintThickness`] || "",
        issues: data?.[`${key}_issues`] || [],
        cladding: data?.[`${key}_cladding`] || false,
        cladding_issues: data?.[`${key}_cladding_issues`] || [],
        orvm_issues: data?.[`${key}_orvm_issues`] || [],
        tail_light_console_left: data?.[`${key}_tail_light_console_left`] || "",
        tail_light_console_right: data?.[`${key}_tail_light_console_right`] || "",
      };
    });
    setPanelValues(initialPanelValues);

    // Initialize photo URLs
    const initialPhotos = {};
    Object.values(imageKeys).forEach(key => {
      initialPhotos[key] = data?.[key] || [];
    });
    setPhotos(initialPhotos);
  }, [data]);

  useEffect(() => {
    return () => {
      Object.values(streamStates).forEach(stream => {
        if (stream) stream.getTracks().forEach(track => track.stop());
      });
    };
  }, [streamStates]);

  const handleInputChange = (key, field, value) => {
    setPanelValues(prev => {
      const newValues = { ...prev, [key]: { ...prev[key], [field]: value } };
      if (onChange) {
        if (field === "issues") onChange(`${key}_issues`, value);
        else if (field === "cladding_issues") onChange(`${key}_cladding_issues`, value);
        else if (field === "orvm_issues") onChange(`${key}_orvm_issues`, value);
        else if (field === "repaint") onChange(`${key}_repaint`, value);
        else if (field === "paintThickness") onChange(`${key}_paintThickness`, value);
        else if (field === "tail_light_console_left") onChange(`${key}_tail_light_console_left`, value);
        else if (field === "tail_light_console_right") onChange(`${key}_tail_light_console_right`, value);
      }
      return newValues;
    });
  };

  const handleCheckboxChange = (key, field, option) => {
    const selected = panelValues[key][field] || [];
    const newSelected = selected.includes(option)
      ? selected.filter(i => i !== option)
      : [...selected, option];
    handleInputChange(key, field, newSelected);
  };

  const handleFileUpload = async (e, photoKey) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return alert("Select a valid image file");

    const arr = photos[photoKey] ? [...photos[photoKey]] : [];
    if (arr.length >= photoCount) return alert(`Maximum ${photoCount} photos allowed`);

    try {
      const uploaded = await FileUploaderService.uploadFileToServer(file, photoKey);
      const imageUrl = uploaded.files?.[0]?.fileUrl || null;
      if (imageUrl) {
        arr.push(imageUrl);
        setPhotos(prev => ({ ...prev, [photoKey]: arr }));
        if (onChange) onChange(photoKey, arr);
        setShowDropdown(null);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image");
    }
  };

  const handleCameraClick = (photoKey) => {
    const arr = photos[photoKey] ? [...photos[photoKey]] : [];
    if (arr.length >= photoCount) return alert(`Maximum ${photoCount} photos allowed`);

    const slotKey = `${photoKey}-${arr.length}`;
    FileUploaderService.handleCameraClick(
      slotKey,
      setStreamStates,
      setIsCameraActive,
      () =>
        FileUploaderService.takePhoto(
          slotKey,
          photo => {
            arr.push(photo);
            setPhotos(prev => ({ ...prev, [photoKey]: arr }));
            if (onChange) onChange(photoKey, arr);
            setShowDropdown(null);
            setIsCameraActive(prev => ({ ...prev, [slotKey]: false }));
          },
          setIsCameraActive,
          () => setShowPhoto(null)
        )
    );
  };

  const toggleDropdown = slotKey => setShowDropdown(curr => (curr === slotKey ? null : slotKey));

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl text-white mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">Body Panels</h2>

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {panels.map(panelKey => {
          const photosArr = photos[imageKeys[panelKey]] || [];
          const { repaint, paintThickness, issues, cladding, cladding_issues, orvm_issues, tail_light_console_left, tail_light_console_right } = panelValues[panelKey] || {};
          const nextSlotKey = `${panelKey}-dropdown`;

          return (
            <div key={panelKey} className="flex flex-col w-full relative border-b border-white/20 pb-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-md text-white font-medium">{labelNames[panelKey]}</label>
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

              {(panelKey !== "front_windshield" && panelKey !== "rear_bumper") && (
                <div className="mb-4">
                  <label className="text-md text-white font-medium mb-2">Paint Thickness</label>
                  <input
                    type="number"
                    value={paintThickness || ""}
                    onChange={e => handleInputChange(panelKey, "paintThickness", e.target.value)}
                    className="p-2 bg-transparent text-white border border-green-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-lime-400"
                    placeholder="Enter thickness (mm)"
                  />
                </div>
              )}

              <div className="mb-4 relative">
                <label className="text-md text-white font-medium mb-2 block">Issues</label>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown(nextSlotKey)}
                    className="p-2 bg-gray-800 border border-green-200 rounded-md w-full text-left flex justify-between items-center"
                  >
                    {issues && issues.length > 0 ? issues.join(", ") : "Select Issues"}
                    <span className="ml-2">&#9662;</span>
                  </button>
                  {showDropdown === nextSlotKey && (
                    <div className="absolute z-20 bg-gray-800 border border-green-200 rounded-md mt-1 w-full max-h-64 overflow-y-auto p-2">
                      {issueOptions.map(opt => (
                        <label key={opt} className="flex items-center mb-1 cursor-pointer text-white">
                          <input
                            type="checkbox"
                            checked={issues?.includes(opt)}
                            onChange={() => handleCheckboxChange(panelKey, "issues", opt)}
                            className="mr-2 w-4 h-4"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Photos */}
              <div className="mt-2 flex flex-wrap gap-4 justify-left items-center relative">
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
                        <button
                          onClick={() => handleCameraClick(imageKeys[panelKey])}
                          className="flex items-center px-4 py-3 w-full text-left text-white hover:bg-gray-700"
                        >
                          <AiOutlineCamera className="mr-2" /> Take Photo
                        </button>
                        <label className="flex items-center px-4 py-3 w-full text-white hover:bg-gray-700 cursor-pointer">
                          <AiOutlineUpload className="mr-2" /> Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, imageKeys[panelKey])}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showPhoto && <FullScreenPhotoViewer photo={showPhoto} onClose={() => setShowPhoto(null)} />}
    </div>
  );
};

export default BodyPanels;