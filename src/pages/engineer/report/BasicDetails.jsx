import React, { useState, useEffect, useRef } from "react";
import { AiOutlinePlus, AiOutlineCamera, AiOutlineUpload } from "react-icons/ai";
import ToggleButton from "./ToggleButton";
import FullScreenPhotoViewer from "./FullScreenPhotoViewer";
import FileUploaderService from "../../../services/upload-document.service";
import { toast } from "react-toastify";

const BasicDetails = ({ data, onChange, showPhoto, setShowPhoto }) => {
  const videoRefs = useRef({
    vinNumber: null,
    engineNumber: null,
    odo: null,
    keys: null,
  });
  const [streamStates, setStreamStates] = useState({
    vinNumber: null,
    engineNumber: null,
    odo: null,
    keys: null,
  });
  const [isCameraActive, setIsCameraActive] = useState({
    vinNumber: false,
    engineNumber: false,
    odo: false,
    keys: false,
  });
  const [isEngineNumberEnabled, setIsEngineNumberEnabled] = useState(true);

  // Photos state keys renamed to match backend
  const [photos, setPhotos] = useState({
    vinNumber_imageUrl: data.vinNumber_imageUrl || null,
    engineNumber_imageUrl: data.engineNumber_imageUrl || null,
    odo_imageUrl: data.odo_imageUrl || null,
    keys_imageUrl: data.keys_imageUrl || null,
  });

  const [showDropdown, setShowDropdown] = useState(null);

  useEffect(() => {
    return () => {
      Object.values(streamStates).forEach((stream) => {
        if (stream) stream.getTracks().forEach((track) => track.stop());
      });
    };
  }, [streamStates]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange(name, type === "checkbox" ? checked : value);
  };

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
          // field is e.g. vinNumber, photo key is vinNumber_imageUrl
          const photoKey = field + "_imageUrl";
          setPhotos((prev) => ({ ...prev, [photoKey]: imageUrl }));
          if (onChange) onChange(photoKey, imageUrl);
          setShowDropdown(null);
        }
      } catch (error) {
        console.error("Image upload failed:", error);
        toast.error("Failed to upload image. Please try again.");
      }
    } else {
      toast.error("Please select a valid image file.");
    }
  };

const handleCameraClick = async (field) => {
  if (!isCameraActive[field]) {
    // 👉 Start camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRefs.current[field]) {
        videoRefs.current[field].srcObject = stream;
      }
      setStreamStates((prev) => ({ ...prev, [field]: stream }));
      setIsCameraActive((prev) => ({ ...prev, [field]: true }));
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Camera access denied or not available");
    }
  } else {
    // 👉 Take photo
    const video = videoRefs.current[field];
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const file = new File([blob], `${field}.png`, { type: "image/png" });
        const uploadedData = await FileUploaderService.uploadFileToServer(file, field);
        const imageUrl = uploadedData.files?.[0]?.fileUrl || null;

        if (imageUrl) {
          const photoKey = field + "_imageUrl";
          setPhotos((prev) => ({ ...prev, [photoKey]: imageUrl }));
          if (onChange) onChange(photoKey, imageUrl);
          setShowDropdown(null);
        }
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload photo");
      }
    }, "image/png");

    // 👉 Stop camera
    if (streamStates[field]) {
      streamStates[field].getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive((prev) => ({ ...prev, [field]: false }));
    setStreamStates((prev) => ({ ...prev, [field]: null }));
  }
};


  const toggleDropdown = (field) => {
    setShowDropdown(showDropdown === field ? null : field);
  };

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl text-white relative">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white">
        Basic Details
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

        {/* VIN Number */}
        <div className="flex flex-col animate-fade-in relative">
          <label className="text-md text-white font-medium">VIN Number</label>
          <div className="mt-2 flex flex-col">
            <input
              type="text"
              name="vinNumber"
              value={data.vinNumber || ""}
              onChange={handleInputChange}
              className="p-3 bg-transparent text-white border border-green-200 shadow-inner rounded-md w-full focus:outline-none focus:ring-2 focus:ring-lime-400"
              placeholder="Enter VIN Number"
            />
            <div className="mt-2 flex items-center relative">
              {photos.vinNumber_imageUrl ? (
                <img
                  src={photos.vinNumber_imageUrl}
                  alt="VIN Number Photo"
                  className="w-16 h-16 rounded-md cursor-pointer mr-2"
                  onClick={() => setShowPhoto(photos.vinNumber_imageUrl)}
                />
              ) : (
                <button
                  onClick={() => toggleDropdown("vinNumber")}
                  className="p-2 rounded-full bg-gray-500 text-white hover:bg-opacity-80 mr-2"
                  aria-label="Add VIN Photo"
                >
                  <AiOutlinePlus className="text-xl" />
                </button>
              )}

              {showDropdown === "vinNumber" && (
                <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-md shadow-lg z-10 w-40">
                  <button
                    onClick={() => handleCameraClick("vinNumber")}
                    className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left"
                  >
                    <AiOutlineCamera className="mr-2" /> Take Photo
                  </button>
                  <label className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer w-full">
                    <AiOutlineUpload className="mr-2" /> Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "vinNumber")}
                    />
                  </label>
                </div>
              )}

              <video
                ref={(el) => (videoRefs.current.vinNumber = el)}
                autoPlay
                className={isCameraActive.vinNumber ? "w-24 h-24 rounded-md ml-2" : "hidden"}
              />
            </div>
          </div>
        </div>

        {/* Engine Number */}
        <div className="flex flex-col animate-fade-in relative">
          <div className="flex items-center justify-between">
            <label className="text-md text-white font-medium">Engine Number</label>
            <ToggleButton
              checked={isEngineNumberEnabled}
              onChange={() => setIsEngineNumberEnabled(!isEngineNumberEnabled)}
            />
          </div>
          <div
            className="mt-2 flex flex-col"
            style={{ display: isEngineNumberEnabled ? "flex" : "none" }}
          >
            <input
              type="text"
              name="engineNumber"
              value={data.engineNumber || ""}
              onChange={handleInputChange}
              className="p-3 bg-transparent text-white border border-green-200 shadow-inner rounded-md w-full focus:outline-none focus:ring-2 focus:ring-lime-400"
              placeholder="Enter Engine Number"
              disabled={!isEngineNumberEnabled}
            />
            <div className="mt-2 flex items-center relative">
              {photos.engineNumber_imageUrl ? (
                <img
                  src={photos.engineNumber_imageUrl}
                  alt="Engine Number Photo"
                  className="w-16 h-16 rounded-md cursor-pointer mr-2"
                  onClick={() => setShowPhoto(photos.engineNumber_imageUrl)}
                />
              ) : (
                <button
                  onClick={() => toggleDropdown("engineNumber")}
                  className="p-2 rounded-full bg-gray-500 text-white hover:bg-opacity-80 mr-2"
                  aria-label="Add Engine Number Photo"
                  style={{
                    opacity: isEngineNumberEnabled ? 1 : 0.5,
                    pointerEvents: isEngineNumberEnabled ? "auto" : "none",
                  }}
                >
                  <AiOutlinePlus className="text-xl" />
                </button>
              )}

              {showDropdown === "engineNumber" && (
                <div
                  className="absolute top-full left-0 mt-2 bg-gray-800 rounded-md shadow-lg z-10 w-40"
                  style={{
                    opacity: isEngineNumberEnabled ? 1 : 0.5,
                    pointerEvents: isEngineNumberEnabled ? "auto" : "none",
                  }}
                >
                  <button
                    onClick={() => handleCameraClick("engineNumber")}
                    className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left"
                  >
                    <AiOutlineCamera className="mr-2" /> Take Photo
                  </button>
                  <label className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer w-full">
                    <AiOutlineUpload className="mr-2" /> Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "engineNumber")}
                      disabled={!isEngineNumberEnabled}
                    />
                  </label>
                </div>
              )}

              <video
                ref={(el) => (videoRefs.current.engineNumber = el)}
                autoPlay
                className={isCameraActive.engineNumber ? "w-24 h-24 rounded-md ml-2" : "hidden"}
              />
            </div>
          </div>
        </div>

        {/* ODO and Keys */}
        <div className="flex flex-col animate-fade-in sm:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col relative">
              <label className="text-md text-white font-medium">ODO</label>
              <div className="mt-2 flex flex-col">
                <input
                  type="number"
                  name="odo"
                  value={data.odo || ""}
                  onChange={handleInputChange}
                  className="p-3 bg-transparent text-white border border-green-200 shadow-inner rounded-md w-full focus:outline-none focus:ring-2 focus:ring-lime-400"
                  placeholder="Enter ODO"
                />
                <div className="mt-2 flex items-center relative">
                  {photos.odo_imageUrl ? (
                    <img
                      src={photos.odo_imageUrl}
                      alt="ODO Photo"
                      className="w-16 h-16 rounded-md cursor-pointer mr-2"
                      onClick={() => setShowPhoto(photos.odo_imageUrl)}
                    />
                  ) : (
                    <button
                      onClick={() => toggleDropdown("odo")}
                      className="p-2 rounded-full bg-gray-500 text-white hover:bg-opacity-80 mr-2"
                      aria-label="Add ODO Photo"
                    >
                      <AiOutlinePlus className="text-xl" />
                    </button>
                  )}

                  {showDropdown === "odo" && (
                    <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-md shadow-lg z-10 w-40">
                      <button
                        onClick={() => handleCameraClick("odo")}
                        className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left"
                      >
                        <AiOutlineCamera className="mr-2" /> Take Photo
                      </button>
                      <label className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer w-full">
                        <AiOutlineUpload className="mr-2" /> Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "odo")}
                        />
                      </label>
                    </div>
                  )}

                  <video
                    ref={(el) => (videoRefs.current.odo = el)}
                    autoPlay
                    className={isCameraActive.odo ? "w-24 h-24 rounded-md ml-2" : "hidden"}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col relative">
              <label className="text-md text-white font-medium">Keys</label>
              <div className="mt-2 flex flex-col">
                <input
                  type="text"
                  name="keys"
                  value={data.keys || ""}
                  onChange={handleInputChange}
                  className="p-3 bg-transparent text-white border border-green-200 shadow-inner rounded-md w-full focus:outline-none focus:ring-2 focus:ring-lime-400"
                  placeholder="Enter Keys Info"
                />
                <div className="mt-2 flex items-center relative">
                  {photos.keys_imageUrl ? (
                    <img
                      src={photos.keys_imageUrl}
                      alt="Keys Photo"
                      className="w-16 h-16 rounded-md cursor-pointer mr-2"
                      onClick={() => setShowPhoto(photos.keys_imageUrl)}
                    />
                  ) : (
                    <button
                      onClick={() => toggleDropdown("keys")}
                      className="p-2 rounded-full bg-gray-500 text-white hover:bg-opacity-80 mr-2"
                      aria-label="Add Keys Photo"
                    >
                      <AiOutlinePlus className="text-xl" />
                    </button>
                  )}

                  {showDropdown === "keys" && (
                    <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-md shadow-lg z-10 w-40">
                      <button
                        onClick={() => handleCameraClick("keys")}
                        className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left"
                      >
                        <AiOutlineCamera className="mr-2" /> Take Photo
                      </button>
                      <label className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer w-full">
                        <AiOutlineUpload className="mr-2" /> Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "keys")}
                        />
                      </label>
                    </div>
                  )}

                  <video
                    ref={(el) => (videoRefs.current.keys = el)}
                    autoPlay
                    className={isCameraActive.keys ? "w-24 h-24 rounded-md ml-2" : "hidden"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dealer PDI */}
        <div className="flex items-center animate-fade-in sm:col-span-2">
          <label className="text-md text-white font-medium">Dealer PDI</label>
          <div className="ml-auto flex items-center">
            <input
              type="checkbox"
              name="dealer_pdi"
              checked={data.dealer_pdi || false}
              onChange={handleInputChange}
              className="h-5 w-5 text-lime-600 focus:ring-lime-500 border-gray-300 rounded mr-2"
            />
            <span>Completed</span>
          </div>
        </div>
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

export default BasicDetails;
