import React, { useState, useEffect, useRef } from "react";
import { AiOutlinePlus, AiOutlineCamera, AiOutlineUpload } from "react-icons/ai";
import FullScreenPhotoViewer from "../report/FullScreenPhotoViewer";
import FileUploaderService from "../../../services/upload-document.service";
import ServerUrl from "../../../core/constants/serverUrl.constant";

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

const photoCountForPanel = (panel) => (specialGlassPanels.has(panel) ? 5 : 1);

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
    "OTHER"
  ]

const glassIssueOptions = [
    "Fitting Mismatch",
    "Scratch",
    "Crack"
];

const Glasses = ({ data = {}, onChange }) => {
  const [photos, setPhotos] = useState({});
  const [brand, setBrand] = useState({});
  const [manufacturingDate, setManufacturingDate] = useState({});
  const [panelIssues, setPanelIssues] = useState({});
  const [showIssueDropdown, setShowIssueDropdown] = useState(null);
  const [showPhotoDropdown, setShowPhotoDropdown] = useState(null);
  const [showPhoto, setShowPhoto] = useState(null);
  const [autoCopiedBrand, setAutoCopiedBrand] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState({});
  const [streamStates, setStreamStates] = useState({});
  const videoRefs = useRef({});
  const issueDropdownRefs = useRef({});


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
        : data[`${panel}_issues`] ? [data[`${panel}_issues`]] : [];
    });
    setPhotos(initPhotos);
    setBrand(initBrand);
    setManufacturingDate(initManufacturingDate);
    setPanelIssues(initIssues);
  }, [data]);
   
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
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [showIssueDropdown]);

  // Cleanup camera streams
  useEffect(() => {
    return () => {
      Object.values(streamStates).forEach((stream) => {
        if (stream) stream.getTracks().forEach((track) => track.stop());
      });
    };
  }, [streamStates]);

  const togglePhotoDropdown = (panel) =>
    setShowPhotoDropdown((curr) => (curr === panel ? null : panel));

  const toggleIssueDropdown = (panel) =>
    setShowIssueDropdown((curr) => (curr === panel ? null : panel));

  const handleFileUpload = async (e, panel) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return alert("Select a valid image file");

    const arr = photos[panel] ? [...photos[panel]] : [];
    if (arr.length >= photoCountForPanel(panel))
      return alert(`Maximum ${photoCountForPanel(panel)} photos allowed`);

    try {
      const uploaded = await FileUploaderService.uploadFileToServer(file, panel);
      const imageUrl = uploaded.files?.[0]?.fileUrl || null;
      if (imageUrl) {
        const fullImageUrl = `${ServerUrl.IMAGE_URL}${imageUrl}`;
        arr.push(fullImageUrl);
        setPhotos((prev) => ({ ...prev, [panel]: arr }));
        onChange && onChange(`${panel}_imageUrls`, arr);
        setShowPhotoDropdown(null);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image");
    }
  };

  // Open camera first, capture on second click
const handleCameraClick = async (panel) => {
  const arr = photos[panel] ? [...photos[panel]] : [];
  if (arr.length >= photoCountForPanel(panel)) {
    return alert(`Maximum ${photoCountForPanel(panel)} photos allowed`);
  }

  const slotKey = `${panel}-${arr.length}`;

  if (!isCameraActive[slotKey]) {
    // 👉 First click: open live preview
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRefs.current[slotKey]) {
        videoRefs.current[slotKey].srcObject = stream;
      }
      setStreamStates((prev) => ({ ...prev, [slotKey]: stream }));
      setIsCameraActive((prev) => ({ ...prev, [slotKey]: true }));
    } catch {
      alert("Camera not available");
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
          const file = new File([blob], `${slotKey}.png`, { type: "image/png" });
          const uploaded = await FileUploaderService.uploadFileToServer(file, panel);
          const imageUrl = uploaded.files?.[0]?.fileUrl || null;

          if (imageUrl) {
            arr.push(imageUrl);
            setPhotos((prev) => ({ ...prev, [panel]: arr }));
            onChange && onChange(`${panel}_imageUrls`, arr);
          }
        } catch (err) {
          console.error("Upload failed:", err);
          alert("Failed to upload image");
        }
      }
    }, "image/png");

    // 👉 Stop camera after capture
    const stream = streamStates[slotKey];
    if (stream) stream.getTracks().forEach((t) => t.stop());

    setStreamStates((prev) => ({ ...prev, [slotKey]: null }));
    setIsCameraActive((prev) => ({ ...prev, [slotKey]: false }));
    setShowPhotoDropdown(null);
  }
};


  const handleInputChange = (field, panel, setter) => (e) => {
    const value = e.target.value;
    setter((prev) => {
      const updated = { ...prev, [panel]: value };
      onChange && onChange(`${panel}_${field}`, value);
      return updated;
    });
  };

  const handleBrandChange = (panel) => (e) => {
    const value = e.target.value;
    setBrand((prev) => {
      const updated = { ...prev, [panel]: value };
      if (!autoCopiedBrand && panel === "front_windshield") {
        glassPanels.forEach((p) => {
          updated[p] = value;
          if (onChange) onChange(`${p}_brand`, value);
        });
        setAutoCopiedBrand(true);
      } else {
        if (onChange) onChange(`${panel}_brand`, value);
      }
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

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">Glass Panels</h2>

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {glassPanels.map((panel) => {
          const photosArr = photos[panel] || [];
          const isSpecial = specialGlassPanels.has(panel);
          const selectedIssues = panelIssues[panel] || [];

          return (
            <div key={panel} className="flex flex-col w-full relative border-b border-white/20 pb-4 mb-4">
              <label className="text-md text-white font-medium mb-2">{labelNames[panel]}</label>

              {isSpecial && (
                <>
                  <div className="mb-4">
                    <label className="text-md text-white font-medium mb-2">Brand</label>
                    <select
                      value={brand[panel] || ""}
                      onChange={handleBrandChange(panel)}
                      className="p-2 bg-gray-800 text-white border border-green-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-lime-400"
                    >
                      <option value="">Select Brand</option>
                      {brandOptions.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="text-md text-white font-medium mb-2">Manufacturing MM/YY</label>
                    <input
                      type="text"
                      value={manufacturingDate[panel] || ""}
                      onChange={handleInputChange("manufacturingDate", panel, setManufacturingDate)}
                      className="p-2 bg-transparent text-white border border-green-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-lime-400"
                      placeholder="MM/YY"
                    />
                  </div>
                </>
              )}

              {/* Issue Dropdown */}
              <div className="mb-4 relative">
                <label className="text-md text-white font-medium mb-2 block">Issues</label>
                <div className="relative">
                  <button
                    onClick={() => toggleIssueDropdown(panel)}
                    className="p-2 bg-gray-800 border border-green-200 rounded-md w-full text-left flex justify-between items-center text-white"
                  >
                    {selectedIssues.length > 0 ? selectedIssues.join(", ") : "Select Issues"}
                    <span className="ml-2">&#9662;</span>
                  </button>

                  {showIssueDropdown === panel && (
                    
 <div  
    ref={el => (issueDropdownRefs.current[panel] = el)}
    className="absolute z-20 bg-gray-800 border border-green-200 rounded-md mt-1 w-full max-h-64 overflow-y-auto p-2"
  >
                      {glassIssueOptions.map((issue) => (
                        <label key={issue} className="flex items-center mb-1 cursor-pointer text-white">
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
              </div>

              <video
  ref={(el) => (videoRefs.current[`${panel}-${photosArr.length}`] = el)}
  autoPlay
  className={isCameraActive[`${panel}-${photosArr.length}`] ? "w-24 h-24 rounded-md mt-2" : "hidden"}
/>


              {/* Photos Section */}
              {selectedIssues.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-4 justify-left items-center relative">
                  {photosArr.map((photoUrl, i) =>
                    photoUrl ? (
                      <img
                        key={`${panel}-${i}`}
                        src={photoUrl}
                        alt={`${labelNames[panel]} photo ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-md cursor-pointer"
                        onClick={() => setShowPhoto(photoUrl)}
                      />
                    ) : null
                  )}

                  {photosArr.length < photoCountForPanel(panel) && (
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <button
                        onClick={() => togglePhotoDropdown(panel)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-500 text-white text-2xl hover:bg-gray-600"
                      >
                        <AiOutlinePlus />
                      </button>

                      {showPhotoDropdown === panel && (
                        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md shadow-lg z-10 w-48">
                          <button
                            onClick={() => handleCameraClick(panel)}
                            className="flex items-center px-4 py-3 w-full text-left text-white hover:bg-gray-700"
                          >
                            <AiOutlineCamera className="mr-2" /> 
                            {isCameraActive[`${panel}-${photosArr.length}`] ? "Capture Photo" : "Take Photo"}

                          </button>
                          <label className="flex items-center px-4 py-3 w-full text-white hover:bg-gray-700 cursor-pointer">
                            <AiOutlineUpload className="mr-2" /> Upload Photo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, panel)}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showPhoto && <FullScreenPhotoViewer photo={showPhoto} onClose={() => setShowPhoto(null)} />}
    </div>
  );
};

export default Glasses;