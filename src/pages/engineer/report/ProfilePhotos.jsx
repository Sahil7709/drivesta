import React, { useState, useEffect, useRef } from "react";
import { AiOutlinePlus, AiOutlineCamera, AiOutlineUpload } from "react-icons/ai";
import FullScreenPhotoViewer from "../report/FullScreenPhotoViewer";
import FileUploaderService from "../../../services/upload-document.service";

const ProfilePhotos = ({ data, onChange }) => {
  const labels = [
    "front_left_imageUrl",
    "rear_left_imageUrl",
    "rear_right_imageUrl",
    "front_right_imageUrl",
  ];

  const labelNames = {
    front_left_imageUrl: "1. Front Left",
    rear_left_imageUrl: "2. Rear Left",
    rear_right_imageUrl: "3. Rear Right",
    front_right_imageUrl: "4. Front Right",
  };

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

  // Attach refs to service
  useEffect(() => {
    labels.forEach((label) => {
      FileUploaderService.setVideoRef(label, videoRefs.current[label]);
    });
  }, []);

  // Sync incoming data
  useEffect(() => {
    setPhotos({
      front_left_imageUrl: data?.front_left_imageUrl || null,
      rear_left_imageUrl: data?.rear_left_imageUrl || null,
      rear_right_imageUrl: data?.rear_right_imageUrl || null,
      front_right_imageUrl: data?.front_right_imageUrl || null,
    });
  }, [data]);

  // Cleanup camera streams on unmount
  useEffect(() => {
    return () => {
      Object.values(streamStates).forEach((stream) => {
        if (stream) stream.getTracks().forEach((track) => track.stop());
      });
    };
  }, [streamStates]);

  // Wrapper for photo capture
  const takePhoto = (label) => {
    FileUploaderService.takePhoto(label, setPhotos, setIsCameraActive, setShowDropdown)
      .then(() => {
        if (onChange && photos[label]) {
          onChange(label, photos[label]);
        }
      })
      .catch((err) => {
        console.error("Photo capture failed:", err);
      });
  };

  // Handle file upload (from gallery)
  const handleFileUpload = async (e, field) => {
    try {
      await FileUploaderService.handleFileUpload(e, field, setPhotos, setShowDropdown);
      if (onChange && photos[field]) {
        onChange(field, photos[field]);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
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
                        onClick={() =>
                          FileUploaderService.handleCameraClick(
                            label,
                            setStreamStates,
                            setIsCameraActive,
                            takePhoto
                          )
                        }
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
