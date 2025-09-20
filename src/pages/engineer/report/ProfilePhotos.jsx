import React, { useState, useEffect, useRef } from "react";
import { AiOutlinePlus, AiOutlineCamera, AiOutlineUpload } from "react-icons/ai";
import FileUploaderService from "../../../services/upload-document.service";

const ProfilePhotos = ({ data, onChange }) => {
  const labels = ["front_left_imageUrl", "rear_left_imageUrl", "rear_right_imageUrl", "front_right_imageUrl"];
  const [photos, setPhotos] = useState({});
  const [showDropdown, setShowDropdown] = useState(null);
  const [previewModal, setPreviewModal] = useState({ visible: false, file: null, label: null });

  const videoRefs = useRef(labels.reduce((acc, label) => ({ ...acc, [label]: null }), {}));
  const [streamStates, setStreamStates] = useState(labels.reduce((acc, label) => ({ ...acc, [label]: null }), {}));
  const [isCameraActive, setIsCameraActive] = useState(labels.reduce((acc, label) => ({ ...acc, [label]: false }), {}));

  const labelNames = {
    front_left_imageUrl: "1. Front Left",
    rear_left_imageUrl: "2. Rear Left",
    rear_right_imageUrl: "3. Rear Right",
    front_right_imageUrl: "4. Front Right",
  };

  useEffect(() => {
    setPhotos({
      front_left_imageUrl: data?.front_left_imageUrl || null,
      rear_left_imageUrl: data?.rear_left_imageUrl || null,
      rear_right_imageUrl: data?.rear_right_imageUrl || null,
      front_right_imageUrl: data?.front_right_imageUrl || null,
    });
  }, [data]);

  const handleFileClick = (label) => setShowDropdown(showDropdown === label ? null : label);

  const handleFileChange = (e, label) => {
    const file = e.target.files[0];
    if (file) {
      FileUploaderService.handleFileSelection(file, label, (previewUrl, fileObj) => {
        setPreviewModal({ visible: true, file: fileObj, label, previewUrl });
      });
    }
  };

  const handleCameraClick = (label) => {
    FileUploaderService.setVideoRef(label, videoRefs.current[label]);
    FileUploaderService.handleCameraClick(label, setStreamStates, setIsCameraActive, (previewUrl, fileObj) => {
      setPreviewModal({ visible: true, file: fileObj, label, previewUrl });
    });
  };

  const handleConfirmUpload = async () => {
    const { label, file } = previewModal;
    if (!file || !label) return;

    try {
      const uploadedData = await FileUploaderService.compressAndUpload(file, label);
      const imageUrl = uploadedData.files?.[0]?.fileUrl || null;
      if (imageUrl) {
        setPhotos((prev) => ({ ...prev, [label]: imageUrl }));
        if (onChange) onChange(label, imageUrl);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Try again.");
    } finally {
      setPreviewModal({ visible: false, file: null, label: null });
      setShowDropdown(null);
    }
  };

  const handleRetake = () => setPreviewModal({ visible: false, file: null, label: null });

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] rounded-2xl p-6 sm:p-8 shadow-lg w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">Profile Photos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {labels.map((label) => (
          <div key={label} className="flex flex-col w-full">
            <label className="text-md mb-2">{labelNames[label]}</label>
            <div className="flex flex-col items-center">
              <div className="relative">
                {photos[label] ? (
                  <img
                    src={photos[label]}
                    alt={labelNames[label]}
                    className="w-24 h-24 object-cover rounded-md cursor-pointer"
                    onClick={() => setPreviewModal({ visible: true, file: null, label, previewUrl: photos[label] })}
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-700 rounded-md flex items-center justify-center">
                    <button onClick={() => handleFileClick(label)} className="p-2 rounded-full bg-gray-500 hover:bg-opacity-80">
                      <AiOutlinePlus className="text-xl" />
                    </button>
                  </div>
                )}

                {showDropdown === label && (
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md shadow-lg w-48 z-10">
                    <button
                      onClick={() => handleCameraClick(label)}
                      className="flex items-center px-4 py-3 text-sm w-full text-left text-white hover:bg-gray-700"
                    >
                      <AiOutlineCamera className="mr-2" /> Take Photo
                    </button>
                    <label className="flex items-center px-4 py-3 text-sm w-full text-left text-white hover:bg-gray-700 cursor-pointer">
                      <AiOutlineUpload className="mr-2" /> Upload Photo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, label)} />
                    </label>
                  </div>
                )}

                <video
                  ref={(el) => (videoRefs.current[label] = el)}
                  autoPlay
                  className={isCameraActive[label] ? "w-24 h-24 rounded-md mt-2" : "hidden"}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewModal.visible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <h3 className="text-lg font-semibold mb-2">Confirm Photo</h3>
            {previewModal.previewUrl && (
              <img src={previewModal.previewUrl} alt="Preview" className="max-w-xs mx-auto mb-4 rounded-md" />
            )}
            <div className="flex justify-center gap-4">
              <button onClick={handleConfirmUpload} className="bg-green-500 px-4 py-2 rounded-md">Confirm</button>
              <button onClick={handleRetake} className="bg-red-500 px-4 py-2 rounded-md">Retake</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotos;
