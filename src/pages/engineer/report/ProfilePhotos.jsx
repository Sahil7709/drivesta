// import React, { useState, useEffect } from "react";
// import {
//   AiOutlinePlus,
//   AiOutlineCamera,
//   AiOutlineUpload,
// } from "react-icons/ai";
// import FileUploaderService from "../../../services/upload-document.service";

// const ProfilePhotos = ({ data, onChange }) => {
//   const labels = [
//     "front_left_imageUrl",
//     "rear_left_imageUrl",
//     "rear_right_imageUrl",
//     "front_right_imageUrl",
//   ];

//   const labelNames = {
//     front_left_imageUrl: "1. Front Left",
//     rear_left_imageUrl: "2. Rear Left",
//     rear_right_imageUrl: "3. Rear Right",
//     front_right_imageUrl: "4. Front Right",
//   };

//   const [photos, setPhotos] = useState(
//     labels.reduce((acc, label) => ({ ...acc, [label]: null }), {})
//   );
//   const [showDropdown, setShowDropdown] = useState(null);

//   // For preview modal
//   const [previewFile, setPreviewFile] = useState(null); // raw file
//   const [previewUrl, setPreviewUrl] = useState(null); // object URL
//   const [activeLabel, setActiveLabel] = useState(null);

//   useEffect(() => {
//     setPhotos({
//       front_left_imageUrl: data?.front_left_imageUrl || null,
//       rear_left_imageUrl: data?.rear_left_imageUrl || null,
//       rear_right_imageUrl: data?.rear_right_imageUrl || null,
//       front_right_imageUrl: data?.front_right_imageUrl || null,
//     });
//   }, [data]);

//   const toggleDropdown = (label) =>
//     setShowDropdown(showDropdown === label ? null : label);

//   // Handle file selection (camera/gallery), open preview modal
//   const handleFileSelect = (e, field) => {
//     const file = e.target.files[0];
//     if (!file || !file.type.startsWith("image/")) {
//       return alert("Please select a valid image file.");
//     }

//     setPreviewFile(file);
//     setPreviewUrl(URL.createObjectURL(file));
//     setActiveLabel(field);
//     setShowDropdown(null);
//   };

//   // Cancel → clear preview
//   const handleCancel = () => {
//     setPreviewFile(null);
//     setPreviewUrl(null);
//     setActiveLabel(null);
//   };

//   // Confirm → upload to server
//   const handleConfirm = async () => {
//     if (!previewFile || !activeLabel) return;

//     try {
//       const uploadedData = await FileUploaderService.uploadFileToServer(
//         previewFile,
//         activeLabel
//       );
//       const imageUrl = uploadedData?.files?.[0]?.fileUrl || null;

//       if (imageUrl) {
//         setPhotos((prev) => ({ ...prev, [activeLabel]: imageUrl }));
//         onChange(activeLabel, imageUrl);
//       }
//     } catch (err) {
//       console.error("Upload failed:", err);
//       alert("Upload failed. Please try again.");
//     } finally {
//       handleCancel();
//     }
//   };

//   return (
//     <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
//       <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">
//         Profile Photos
//       </h2>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
//         {labels.map((label) => (
//           <div key={label} className="flex flex-col w-full">
//             <label className="text-md text-white font-medium text-left mb-2">
//               {labelNames[label]}
//             </label>
//             <div className="mt-2 flex flex-col items-center">
//               <div className="relative">
//                 {photos[label] ? (
//                   <img
//                     src={photos[label]}
//                     alt={labelNames[label]}
//                     className="w-24 h-24 object-cover rounded-md cursor-pointer"
//                   />
//                 ) : (
//                   <div className="w-24 h-24 bg-gray-700 rounded-md flex items-center justify-center">
//                     <button
//                       onClick={() => toggleDropdown(label)}
//                       className="p-2 rounded-full bg-gray-500 text-white hover:bg-opacity-80"
//                     >
//                       <AiOutlinePlus className="text-xl" />
//                     </button>
//                   </div>
//                 )}

//                 {showDropdown === label && (
//                   <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md shadow-lg z-10 w-48">
//                     {/* Open Native Camera */}
//                     <label className="flex items-center px-4 py-3 text-sm text-white hover:bg-gray-700 cursor-pointer w-full">
//                       <AiOutlineCamera className="mr-2" /> Take Photo
//                       <input
//                         type="file"
//                         accept="image/*"
//                         capture="environment"
//                         className="hidden"
//                         onChange={(e) => handleFileSelect(e, label)}
//                       />
//                     </label>

//                     {/* Upload from Gallery */}
//                     <label className="flex items-center px-4 py-3 text-sm text-white hover:bg-gray-700 cursor-pointer w-full">
//                       <AiOutlineUpload className="mr-2" /> Upload Photo
//                       <input
//                         type="file"
//                         accept="image/*"
//                         className="hidden"
//                         onChange={(e) => handleFileSelect(e, label)}
//                       />
//                     </label>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ✅ Preview Modal */}
//       {previewUrl && (
//         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
//           <div className="bg-gray-900 rounded-lg p-6 w-96 text-center">
//             <h3 className="text-lg font-semibold mb-4">Preview Photo</h3>
//             <img
//               src={previewUrl}
//               alt="Preview"
//               className="w-full h-64 object-contain rounded-md mb-4"
//             />
//             <div className="flex justify-between">
//               <button
//                 onClick={handleCancel}
//                 className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirm}
//                 className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-500"
//               >
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProfilePhotos;

import React, { useState, useEffect } from "react";
import { AiOutlinePlus, AiOutlineCamera, AiOutlineUpload } from "react-icons/ai";
import FileUploaderService from "../../../services/upload-document.service";
import imageCompression from "browser-image-compression";

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

  const [photos, setPhotos] = useState(
    labels.reduce((acc, label) => ({ ...acc, [label]: null }), {})
  );
  const [showDropdown, setShowDropdown] = useState(null);

  // Preview modal state
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeLabel, setActiveLabel] = useState(null);

  useEffect(() => {
    setPhotos({
      front_left_imageUrl: data?.front_left_imageUrl || null,
      rear_left_imageUrl: data?.rear_left_imageUrl || null,
      rear_right_imageUrl: data?.rear_right_imageUrl || null,
      front_right_imageUrl: data?.front_right_imageUrl || null,
    });
  }, [data]);

  const toggleDropdown = (label) =>
    setShowDropdown(showDropdown === label ? null : label);

  // Compress image before upload
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,           // Max 1 MB
      maxWidthOrHeight: 1024, // Resize to 1024px
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
    } catch (err) {
      console.warn("Image compression failed, uploading original", err);
      return file;
    }
  };

  // Handle file selection (camera/gallery)
  const handleFileSelect = async (e, label) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      return alert("Please select a valid image file.");
    }

    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setActiveLabel(label);
    setShowDropdown(null);
  };

  // Cancel → clear preview
  const handleCancel = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
    setActiveLabel(null);
  };

  // Confirm → compress & upload
  const handleConfirm = async () => {
    if (!previewFile || !activeLabel) return;

    try {
      // Compress image before uploading
      const compressedFile = await compressImage(previewFile);

      const uploadedData = await FileUploaderService.uploadFileToServer(
        compressedFile,
        activeLabel
      );
      const imageUrl = uploadedData?.files?.[0]?.fileUrl || null;

      if (imageUrl) {
        setPhotos((prev) => ({ ...prev, [activeLabel]: imageUrl }));
        onChange(activeLabel, imageUrl);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      handleCancel();
    }
  };

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">
        Profile Photos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {labels.map((label) => (
          <div key={label} className="flex flex-col w-full">
            <label className="text-md text-white font-medium text-left mb-2">
              {labelNames[label]}
            </label>
            <div className="mt-2 flex flex-col items-center">
              <div className="relative">
                {photos[label] ? (
                  <img
                    src={photos[label]}
                    alt={labelNames[label]}
                    className="w-24 h-24 object-cover rounded-md cursor-pointer"
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

                {showDropdown === label && (
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md shadow-lg z-10 w-48">
                    {/* Camera */}
                    <label className="flex items-center px-4 py-3 text-sm text-white hover:bg-gray-700 cursor-pointer w-full">
                      <AiOutlineCamera className="mr-2" /> Take Photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, label)}
                      />
                    </label>

                    {/* Upload from Gallery */}
                    <label className="flex items-center px-4 py-3 text-sm text-white hover:bg-gray-700 cursor-pointer w-full">
                      <AiOutlineUpload className="mr-2" /> Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, label)}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
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

export default ProfilePhotos;

