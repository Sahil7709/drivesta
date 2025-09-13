import React, { useState, useEffect, useRef } from "react";
import { AiOutlinePlus, AiOutlineCamera, AiOutlineUpload } from "react-icons/ai";
import FullScreenPhotoViewer from "../report/FullScreenPhotoViewer";
import FileUploaderService from "../../../services/upload-document.service";
import ToggleButton from "../report/ToggleButton";

const plasticPanels = [
  "driver_door",
  "codriver_door",
  "rear_left_passenger_door",
  "rear_right_passenger_door",
  "third_row",
  "dashboard",
  "gear_console",
  "steering",
  "ac_vents",
  "rear_ac_vents",
  "irvm",
];

const labelNames = {
  driver_door: "Driver Door",
  codriver_door: "Co-Driver Door",
  rear_left_passenger_door: "Rear Left Passenger Door",
  rear_right_passenger_door: "Rear Right Passenger Door",
  third_row: "Third Row",
  dashboard: "Dashboard",
  gear_console: "Gear Console",
  steering: "Steering",
  ac_vents: "AC Vents",
  rear_ac_vents: "Rear AC Vents",
  irvm: "IRVM",
};

const photoCount = 5;
const issueOptions = [
      "Scratches",
      "Plastic Chipping",
      "Skim Marks",
      "Sticky Surface"
    ]
const PlasticPanel = ({ data = {}, onChange }) => {
  const [condition, setCondition] = useState(() => {
    const init = {};
    plasticPanels.forEach((panel) => {
      const existing = data?.[`plastic_${panel}_issues`];
      init[panel] = Array.isArray(existing) ? existing : existing ? [existing] : [];
    });
    return init;
  });

  const [photos, setPhotos] = useState(() => {
    const init = {};
    plasticPanels.forEach((panel) => {
      const imgs = Array.isArray(data?.[`plastic_${panel}_imageUrls`])
        ? data[`plastic_${panel}_imageUrls`]
        : [];
      init[panel] = [...imgs, ...Array(photoCount - imgs.length).fill(null)].slice(0, photoCount);
    });
    return init;
  });

  const [thirdRowEnabled, setThirdRowEnabled] = useState(data?.plastic_third_row_toggle || false);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showPhoto, setShowPhoto] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState({});
  const [streamStates, setStreamStates] = useState({});
  const videoRefs = useRef({});
  const dropdownRefs = useRef({});


  useEffect(() => {
  function handleClickOutside(event) {
    let clickedInside = false;

    Object.values(dropdownRefs.current).forEach((ref) => {
      if (ref && ref.contains(event.target)) {
        clickedInside = true;
      }
    });

    if (!clickedInside) {
      setShowDropdown(null);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

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
      onChange?.(`plastic_${panel}_issues`, updated);
      return { ...prev, [panel]: updated };
    });
  };

  const updatePhotos = (panel, newPhotos) => {
    setPhotos((prev) => {
      const updated = { ...prev, [panel]: newPhotos };
      onChange?.(`plastic_${panel}_imageUrls`, newPhotos.filter(Boolean));
      return updated;
    });
  };

  const toggleThirdRow = () => {
    const newVal = !thirdRowEnabled;
    setThirdRowEnabled(newVal);
    onChange?.("plastic_third_row_toggle", newVal);
  };

  const handleFileUpload = async (e, panel, idx) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return alert("Select a valid image file");

    const arr = [...photos[panel]];
    try {
      const uploaded = await FileUploaderService.uploadFileToServer(file, panel);
      const imageUrl = uploaded.files?.[0]?.fileUrl || null;
      if (imageUrl) {
        arr[idx] = imageUrl;
        updatePhotos(panel, arr);
        setShowDropdown(null);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image");
    }
  };

  const handleCameraClick = async (panel, idx) => {
    const slotKey = `${panel}-${idx}`;
    if (!isCameraActive[slotKey]) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRefs.current[slotKey]) videoRefs.current[slotKey].srcObject = stream;
        setStreamStates((prev) => ({ ...prev, [slotKey]: stream }));
        setIsCameraActive((prev) => ({ ...prev, [slotKey]: true }));
      } catch {
        alert("Camera access denied or not available.");
      }
    } else {
      const video = videoRefs.current[slotKey];
      if (!video) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

      const photo = canvas.toDataURL("image/png");
      const arr = [...photos[panel]];
      arr[idx] = photo;
      updatePhotos(panel, arr);

      streamStates[slotKey]?.getTracks().forEach((track) => track.stop());
      setIsCameraActive((prev) => ({ ...prev, [slotKey]: false }));
      setStreamStates((prev) => ({ ...prev, [slotKey]: null }));
      setShowDropdown(null);
    }
  };

  const toggleDropdown = (slotKey) => {
    setShowDropdown((curr) => (curr === slotKey ? null : slotKey));
  };

  const handlePlusClick = (panel, idx) => {
    if (photos[panel]?.[idx]) {
      setShowPhoto(photos[panel][idx]);
    } else {
      toggleDropdown(`${panel}-${idx}`);
    }
  };

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">Plastic Panels</h2>

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {plasticPanels.map((panel, idx) => {
          const panelPhotos = photos[panel] || [];
          const firstEmptyIdx = panelPhotos.findIndex((p) => !p);

          return (
            <div key={panel} className="flex flex-col w-full relative">
              <div className="flex justify-between items-center mb-2">
                <label className="text-md text-white font-medium text-left">
                  {`${idx + 1}. ${labelNames[panel] || panel.replace(/_/g, " ")}`}
                </label>
                {panel === "third_row" && <ToggleButton checked={thirdRowEnabled} onChange={toggleThirdRow} />}
              </div>

              {(panel !== "third_row" || thirdRowEnabled) && (
                <>
                  {/* Issues Dropdown with Checkboxes */}
                  <div className="mb-4 relative"     ref={(el) => (dropdownRefs.current[panel] = el)}
>
                    <label className="text-md text-white font-medium text-left mb-2">Issues</label>
                    <button
                      type="button"
                      onClick={() => toggleDropdown(panel)}
                      className="w-full bg-gray-800 text-white p-2 rounded-md flex justify-between items-center focus:outline-none"
                    >
                      {condition[panel].length > 0 ? condition[panel].join(", ") : "Select Issues"}
                      <span className="ml-2">&#9662;</span>
                    </button>

                    {showDropdown === panel && (
                      <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-white/20 rounded-md shadow-lg max-h-48 overflow-auto">
                        {issueOptions.map((issue) => (
                          <label
                            key={issue}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer text-white hover:bg-gray-700"
                          >
                            <input
                              type="checkbox"
                              checked={condition[panel].includes(issue)}
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
                  {condition[panel].length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-4 justify-left items-center relative"     ref={(el) => (dropdownRefs.current[`${panel}-${firstEmptyIdx}`] = el)}>
                      {panelPhotos.map((photo, i) =>
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

                      {firstEmptyIdx !== -1 && (
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <button
                            onClick={() => handlePlusClick(panel, firstEmptyIdx)}
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-500 hover:bg-gray-600 text-white text-2xl"
                          >
                            <AiOutlinePlus />
                          </button>

                          {showDropdown === `${panel}-${firstEmptyIdx}` && (
                            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md shadow-lg z-10 w-48">
                              <button
                                onClick={() => handleCameraClick(panel, firstEmptyIdx)}
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
                                  onChange={(e) => handleFileUpload(e, panel, firstEmptyIdx)}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      )}

                      {panelPhotos.map((_, i) => (
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
          );
        })}
      </div>

      {showPhoto && <FullScreenPhotoViewer photo={showPhoto} onClose={() => setShowPhoto(null)} />}
    </div>
  );
};

export default PlasticPanel;