import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  AiOutlinePlus,
  AiOutlineCamera,
  AiOutlineUpload,
  AiOutlineClose,
} from "react-icons/ai";
import PropTypes from "prop-types";
import FileUploaderService from "../../../services/upload-document.service";
import imageCompression from "browser-image-compression";
import ServerUrl from "../../../core/constants/serverUrl.constant";

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

const ProfilePhotos = ({ data, onChange }) => {
  const [photos, setPhotos] = useState(
    labels.reduce((acc, label) => ({ ...acc, [label]: null }), {})
  );
  const [showDropdown, setShowDropdown] = useState(null);

  // Preview
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // track the object URL so we can revoke it safely
  const previewObjectUrlRef = useRef(null);
  const [activeLabel, setActiveLabel] = useState(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  // refs for click-outside
  const containerRef = useRef(null);
  const dropdownRef = useRef({}); // map of label => DOM node

  // Safe image URL builder (avoids double slashes and handles absolute URLs)
  const makeImageSrc = useCallback((path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const base = (ServerUrl.IMAGE_URL || "").replace(/\/$/, "");
    const p = String(path).replace(/^\//, "");
    return `${base}/${p}`;
  }, []);

  useEffect(() => {
    setPhotos({
      front_left_imageUrl: data?.front_left_imageUrl || null,
      rear_left_imageUrl: data?.rear_left_imageUrl || null,
      rear_right_imageUrl: data?.rear_right_imageUrl || null,
      front_right_imageUrl: data?.front_right_imageUrl || null,
    });
  }, [data]);

  // Click outside handler to close any open dropdown or modal
  useEffect(() => {
    const handleDocClick = (e) => {
      // if click outside any dropdown or the main container, close dropdown
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setShowDropdown(null);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowDropdown(null);
        handleCancel();
      }
    };
    document.addEventListener("click", handleDocClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("click", handleDocClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []); // run once

  // Revoke preview object URL when it changes or on unmount
  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }
    };
  }, []);

  const toggleDropdown = useCallback((label) => {
    setShowDropdown((prev) => (prev === label ? null : label));
  }, []);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
    } catch (err) {
      console.warn("Image compression failed, uploading original", err);
      return file;
    }
  };

  const handleFileSelect = useCallback((e, label) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    // revoke previous preview object URL if any
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;
    setPreviewFile(file);
    setPreviewUrl(objectUrl);
    setActiveLabel(label);
    setShowDropdown(null);

    // clear the file input value so same file can be re-selected later if needed
    e.target.value = "";
  }, []);

  const handleCancel = useCallback(() => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
    setPreviewFile(null);
    setPreviewUrl(null);
    setActiveLabel(null);
    setError(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!previewFile || !activeLabel) return;

    setError(null);
    setIsUploading(true);
    try {
      const compressed = await compressImage(previewFile);

      // ensure we upload a File with original filename
      const fileToUpload =
        compressed instanceof File
          ? compressed
          : new File([compressed], previewFile.name || "photo.jpg", {
              type: compressed.type || previewFile.type || "image/jpeg",
            });

      // If your service expects FormData, update service accordingly.
      // Here I keep your original call signature but ensure we pass a File.
      const uploadedData = await FileUploaderService.uploadFileToServer(
        fileToUpload,
        activeLabel
      );

      const imageUrl = uploadedData?.files?.[0]?.fileUrl || null;

      if (imageUrl) {
        setPhotos((prev) => ({ ...prev, [activeLabel]: imageUrl }));
        onChange(activeLabel, imageUrl);
      } else {
        throw new Error("No fileUrl returned from upload");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      handleCancel();
    }
  }, [previewFile, activeLabel, handleCancel, onChange]);

  const removePhoto = useCallback(
    (label) => {
      // remove locally and notify parent
      setPhotos((prev) => ({ ...prev, [label]: null }));
      onChange(label, null);
      setShowDropdown(null);
    },
    [onChange]
  );

  return (
    <div
      ref={containerRef}
      className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white"
      role="region"
      aria-label="Profile photos"
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">
        Profile Photos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {labels.map((label) => {
          const src = photos[label] ? makeImageSrc(photos[label]) : null;
          return (
            <div key={label} className="flex flex-col w-full">
              <label className="text-md text-white font-medium text-left mb-2">
                {labelNames[label]}
              </label>

              <div className="mt-2 flex flex-col items-center relative">
                <div className="relative">
                  {src ? (
                    <div className="relative group">
                      <img
                        src={src}
                        alt={labelNames[label]}
                        className="w-24 h-24 object-cover rounded-md cursor-pointer"
                        onClick={() => toggleDropdown(label)}
                      />
                      {/* small overlay actions (replace/remove) */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <button
                          className="mr-2 bg-black/50 px-2 py-1 rounded text-sm"
                          onClick={() => toggleDropdown(label)}
                          aria-expanded={showDropdown === label}
                        >
                          Replace
                        </button>
                        <button
                          className="bg-red-600/80 px-2 py-1 rounded text-sm"
                          onClick={() => removePhoto(label)}
                          aria-label={`Remove ${labelNames[label]}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-700 rounded-md flex items-center justify-center">
                      <button
                        onClick={() => toggleDropdown(label)}
                        className="p-2 rounded-full bg-gray-500 text-white hover:bg-opacity-80"
                        aria-haspopup="menu"
                        aria-expanded={showDropdown === label}
                      >
                        <AiOutlinePlus className="text-xl" />
                      </button>
                    </div>
                  )}

                  {showDropdown === label && (
                    <div
                      ref={(el) => (dropdownRef.current[label] = el)}
                      className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md shadow-lg z-10 w-48"
                      role="menu"
                      aria-label={`${labelNames[label]} menu`}
                    >
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

                      {/* Optionally remove */}
                      {photos[label] && (
                        <button
                          onClick={() => removePhoto(label)}
                          className="flex items-center px-4 py-3 text-sm text-red-400 hover:bg-gray-700 w-full"
                        >
                          <AiOutlineClose className="mr-2" /> Remove Photo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/60"
            onClick={handleCancel}
            aria-hidden="true"
          />
          <div className="relative bg-gray-900 rounded-lg p-6 w-11/12 sm:w-96 text-center z-60">
            <h3 className="text-lg font-semibold mb-4">Preview Photo</h3>
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-contain rounded-md mb-4"
            />
            {error && <p className="text-red-400 mb-2">{error}</p>}
            <div className="flex justify-between">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-500"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ProfilePhotos.propTypes = {
  data: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

ProfilePhotos.defaultProps = {
  data: {},
};

export default ProfilePhotos;