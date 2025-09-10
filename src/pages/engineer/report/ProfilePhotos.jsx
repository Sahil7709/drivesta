import React, { useState, useEffect, useRef } from "react";
import {
  AiOutlinePlus,
  AiOutlineCamera,
  AiOutlineUpload,
} from "react-icons/ai";
import FullScreenPhotoViewer from "../report/FullScreenPhotoViewer";
import FileUploaderService from "../../../services/upload-document.service";

const ProfilePhotos = ({data, onChange }) => {
  const labels = [
    "front_left_imageUrl",
    "rear_left_imageUrl",
    "rear_right_imageUrl",
    "front_right_imageUrl",
  ];

  useEffect(() => {

    setPhotos({"front_left_imageUrl":data?.front_left_imageUrl || null,
    "rear_left_imageUrl":data?.rear_left_imageUrl || null,
    "rear_right_imageUrl":data?.rear_right_imageUrl || null,
    "front_right_imageUrl":data?.front_right_imageUrl || null});

  },[data])

  const videoRefs = useRef(
    labels.reduce((acc, label) => ({ ...acc, [label]: null }), {})
  );
  const [streamStates, setStreamStates] = useState(
    labels.reduce((acc, label) => ({ ...acc, [label]: null }), {})
  );
  const [isCameraActive, setIsCameraActive] = useState(
    labels.reduce((acc, label) => ({ ...acc, [label]: false }), {})
  );
  const [photos, setPhotos] = useState(
    labels.reduce((acc, label) => ({ ...acc, [label]: null }), {})
  );
  const [showDropdown, setShowDropdown] = useState(null);
  const [showPhoto, setShowPhoto] = useState(null);

  const labelNames = {
    front_left_imageUrl: "1. Front Left",
    rear_left_imageUrl: "2. Rear Left",
    rear_right_imageUrl: "3. Rear Right",
    front_right_imageUrl: "4. Front Right",
  };

  // Cleanup camera streams on unmount
  useEffect(() => {
    return () => {
      Object.values(streamStates).forEach((stream) => {
        if (stream) stream.getTracks().forEach((track) => track.stop());
      });
    };
  }, [streamStates]);

  // Handle file upload
  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const uploadedData = await FileUploaderService.uploadFileToServer(
          file,
          field
        );
        const imageUrl = uploadedData.files?.[0]?.fileUrl || null;
        if (imageUrl) {
          setPhotos((prev) => ({ ...prev, [field]: imageUrl }));
          if (onChange) onChange(field, imageUrl);
          setShowDropdown(null);
        }
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Failed to upload image. Please try again.");
      }
    } else {
      alert("Please select a valid image file.");
    }
  };

  // Handle camera capture
  // Handle camera click (open on first click, capture on second click)
const handleCameraClick = async (field) => {
  if (!isCameraActive[field]) {
    // 👉 First click: open camera
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");

      if (videoDevices.length < 2) {
        alert("This device does not have a second camera.");
        return;
      }

      // Pick the 2nd camera (index 1)
      const constraints = {
        video: { deviceId: { exact: videoDevices[1].deviceId } }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRefs.current[field]) {
        videoRefs.current[field].srcObject = stream;
      }
      setStreamStates((prev) => ({ ...prev, [field]: stream }));
      setIsCameraActive((prev) => ({ ...prev, [field]: true }));
    } catch {
      alert("Camera not available.");
    }
  } else {
    // 👉 Second click: capture photo
    const video = videoRefs.current[field];
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          const file = new File([blob], `${field}.png`, { type: "image/png" });
          const uploadedData = await FileUploaderService.uploadFileToServer(file, field);
          const imageUrl = uploadedData.files?.[0]?.fileUrl || null;

          if (imageUrl) {
            setPhotos((prev) => ({ ...prev, [field]: imageUrl }));
            if (onChange) onChange(field, imageUrl);
          }
        } catch (err) {
          console.error("Upload failed:", err);
          alert("Failed to upload image. Try again.");
        }
      }
    }, "image/png");

    // 👉 stop camera after capture
    const stream = streamStates[field];
    if (stream) stream.getTracks().forEach((t) => t.stop());

    setStreamStates((prev) => ({ ...prev, [field]: null }));
    setIsCameraActive((prev) => ({ ...prev, [field]: false }));
    setShowDropdown(null);
  }
};


  const toggleDropdown = (label) => {
    setShowDropdown(showDropdown === label ? null : label);
  };

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white text-left">
        Profile Photos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {labels.map((label) => (
          <div key={label} className="flex flex-col w-full">
            <label className="text-md text-white font-medium text-left mb-2">
              {labelNames[label]}
            </label>
            <div className="mt-2 flex flex-col items-center">
              <div className="mt-2 flex flex-wrap gap-4 justify-center">
                <div className="relative">
                  {photos[label] ? (
                    <img
                      src={photos[label]}
                      alt={labelNames[label]}
                      className="w-24 h-24 object-cover rounded-md cursor-pointer"
                      onClick={() => setShowPhoto(photos[label])}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-700 rounded-md flex items-center justify-center">
                      <button
                        onClick={() => toggleDropdown(label)}
                        className="p-2 rounded-full bg-gray-500 text-white hover:bg-opacity-80"
                      >
                        <AiOutlinePlus className="text-xl" />
                      </button>
                    </div>
                  )}

                  {/* Dropdown options */}
                  {showDropdown === label && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md shadow-lg z-10 w-48">
                      <button
                        onClick={() => handleCameraClick(label)}
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
                          onChange={(e) => handleFileUpload(e, label)}
                        />
                      </label>
                    </div>
                  )}

                  {/* Live camera preview */}
                  <video
                    ref={(el) => (videoRefs.current[label] = el)}
                    autoPlay
                    className={
                      isCameraActive[label] ? "w-24 h-24 rounded-md" : "hidden"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Photo View */}
      {showPhoto && (
        <FullScreenPhotoViewer
          photo={showPhoto}
          onClose={() => setShowPhoto(null)}
        />
      )}
    </div>
  );
};

export default ProfilePhotos;
