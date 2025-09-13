import React, { useState, useEffect, useRef } from "react";
import { AiOutlinePlus, AiOutlineCamera, AiOutlineUpload } from "react-icons/ai";
import FullScreenPhotoViewer from "../report/FullScreenPhotoViewer";
import FileUploaderService from "../../../services/upload-document.service";
import ServerUrl from "../../../core/constants/serverUrl.constant";
import ToggleButton from "../report/ToggleButton";


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
      init[panel] = Array.isArray(existing) ? existing : existing ? [existing] : [];
    });
    return init;
  });

  const [photos, setPhotos] = useState(() => {
    const init = {};
    rubberPanels.forEach((panel) => {
      const imgs = Array.isArray(data?.[`${panel}_imageUrls`]) ? data[`${panel}_imageUrls`] : [];
      init[panel] = [...imgs, ...Array(photoCount - imgs.length).fill(null)].slice(0, photoCount);
    });
    return init;
  });

  const [rearWiperEnabled, setRearWiperEnabled] = useState(data?.rubber_rear_wiper_toggle || false);
  const [showPhotoDropdown, setShowPhotoDropdown] = useState(null);
  const [showPhoto, setShowPhoto] = useState(null);
  const [showIssueDropdown, setShowIssueDropdown] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState({});
  const [streamStates, setStreamStates] = useState({});
  const videoRefs = useRef({});
const issueDropdownRefs = useRef({}); //add 

useEffect(() => {     // add
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

  useEffect(() => {
    return () => {
      Object.values(streamStates).forEach((stream) => {
        if (stream) stream.getTracks().forEach((track) => track.stop());
      });
    };
  }, [streamStates]);         
  

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

  const updatePhotos = (panel, newPhotos) => {
    setPhotos((prev) => {
      const updated = { ...prev, [panel]: newPhotos };
      onChange && onChange(`${panel}_imageUrls`, newPhotos.filter(Boolean));
      return updated;
    });
  };

  const toggleRearWiper = () => {
    const newVal = !rearWiperEnabled;
    setRearWiperEnabled(newVal);
    onChange && onChange("rubber_rear_wiper_toggle", newVal);
  };

  const handleFileUpload = async (e, panel, idx) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return alert("Select a valid image file");

    const arr = [...photos[panel]];
    try {
      const uploaded = await FileUploaderService.uploadFileToServer(file, panel);
      const imageUrl = uploaded.files?.[0]?.fileUrl || null;
      if (imageUrl) {
        const fullImageUrl = `${ServerUrl.IMAGE_URL}${imageUrl}`;
        arr[idx] = fullImageUrl;
        updatePhotos(panel, arr);
        setShowPhotoDropdown(null);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image");
    }
  };

 const handleCameraClick = async (panel, idx) => {
  const slotKey = `${panel}-${idx}`;

  if (!isCameraActive[slotKey]) {
    // 👉 First click: open camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRefs.current[slotKey]) {
        videoRefs.current[slotKey].srcObject = stream;
      }
      setStreamStates((prev) => ({ ...prev, [slotKey]: stream }));
      setIsCameraActive((prev) => ({ ...prev, [slotKey]: true }));
    } catch {
      alert("Camera access denied or not available.");
    }
  } else {
    // 👉 Second click: capture photo
    const video = videoRefs.current[slotKey];
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          const file = new File([blob], `${slotKey}.png`, { type: "image/png" });
          const uploaded = await FileUploaderService.uploadFileToServer(file, panel);
          const imageUrl = uploaded.files?.[0]?.fileUrl || null;

          if (imageUrl) {
            const arr = [...photos[panel]];
            arr[idx] = imageUrl;
            updatePhotos(panel, arr);
          }
        } catch (err) {
          console.error("Upload failed:", err);
          alert("Failed to upload photo");
        }
      }
    }, "image/png");

    // 👉 Stop camera after capture
    const stream = streamStates[slotKey];
    if (stream) stream.getTracks().forEach((track) => track.stop());

    setIsCameraActive((prev) => ({ ...prev, [slotKey]: false }));
    setStreamStates((prev) => ({ ...prev, [slotKey]: null }));
    setShowPhotoDropdown(null);
  }
};


  const handlePlusClick = (panel) => {
    const idx = photos[panel].findIndex((p) => !p);
    if (idx !== -1) setShowPhotoDropdown(`${panel}-${idx}`);
  };

  const capitalizeFirstWord = (str) => {
    if (!str) return str;
    const words = str.trim().split(" ");
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(" ");
  };

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">Rubber Panels</h2>

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {rubberPanels.map((panel, idx) => (
          <div key={panel} className="flex flex-col w-full relative">
            <div className="flex justify-between items-center mb-2">
              <label className="text-md text-white font-medium text-left">
                {`${idx + 1}. ${labelNames[panel] || capitalizeFirstWord(panel.replace(/_/g, " "))}`}
              </label>
              {panel === "rubber_rear_wiper" && <ToggleButton checked={rearWiperEnabled} onChange={toggleRearWiper} />}
            </div>

            {(panel !== "rubber_rear_wiper" || rearWiperEnabled) && (
              <>
                {/* Multi-select dropdown for issues */}
                <div className="mb-4 relative"     ref={el => (issueDropdownRefs.current[panel] = el)}
>
    

                  <label className="text-md text-white font-medium text-left mb-2">Issues</label>
                  <button
                    type="button"
                    onClick={() => setShowIssueDropdown(prev => (prev === panel ? null : panel))}  //add
                    
                    className="w-full bg-gray-800 text-white p-2 rounded-md flex justify-between items-center focus:outline-none"
                  >
                    {condition[panel].length > 0 ? condition[panel].join(", ") : "Select Issues"}
                    <span className="ml-2">&#9662;</span>
                  </button>
                  {showIssueDropdown === panel && (
                    <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-white/20 rounded-md shadow-lg max-h-48 overflow-auto">
                      {getIssueOptions(panel).map((issue) => (
                        <label
                          key={issue}
                          className="flex items-center gap-2 px-4 py-2 cursor-pointer text-white hover:bg-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={condition[panel].includes(issue)}
                            onChange={() => handleConditionChange(panel, issue)}
                            className="w-4 h-4 "
                          />
                          {issue}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Photos */}
                {condition[panel].length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-4 justify-left items-center relative">
                    {photos[panel].map((photo, i) =>
                      photo ? (
                        <img
                          key={i}
                          src={photo}
                          alt={`${panel} photo ${i + 1}`}
                          className="w-24 h-24 object-cover rounded-md cursor-pointer"
                          onClick={() => setShowPhoto(photo)}
                        />
                      ) : null
                    )}

                    {photos[panel].some((p) => !p) && (
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <button
                          onClick={() => handlePlusClick(panel)}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-500 hover:bg-gray-600 text-white text-xl"
                        >
                          <AiOutlinePlus />
                        </button>

                        {showPhotoDropdown === `${panel}-${photos[panel].findIndex(p => !p)}` && (
                          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md shadow-lg z-10 w-48">
                            <button
                              onClick={() => handleCameraClick(panel, photos[panel].findIndex(p => !p))}
                              className="flex items-center px-4 py-3 text-sm text-white hover:bg-gray-700 w-full text-left"
                            >
                              <AiOutlineCamera className="mr-2" /> Take Photo
                            </button>
                            <label className="flex items-center px-4 py-3 text-sm text-white hover:bg-gray-700 cursor-pointer w-full">
                              <AiOutlineUpload className="mr-2" /> Upload Photo
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(e, panel, photos[panel].findIndex((p) => !p))
                                }
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    )}

                    {photos[panel].map((_, i) => (
                      <video
                        key={`video-${i}`}
                        ref={(el) => (videoRefs.current[`${panel}-${i}`] = el)}
                        autoPlay
                        className={isCameraActive[`${panel}-${i}`] ? "w-24 h-24 rounded-md" : "hidden"}
                      />
                      
                    ))}
                  </div>
                  
                )}
              </>
            )}
          </div>
          
        ))}
      </div>

      {showPhoto && <FullScreenPhotoViewer photo={showPhoto} onClose={() => setShowPhoto(null)} />}
    </div>
    
  );
};

export default RubberComponent;