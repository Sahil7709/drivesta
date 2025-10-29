import React, { useState, useEffect, useRef } from "react";
import {
  AiOutlinePlus,
  AiOutlineCamera,
  AiOutlineUpload,
} from "react-icons/ai";
import FileUploaderService from "../../../services/upload-document.service";
import FullScreenPhotoViewer from "./FullScreenPhotoViewer";

const labelNames = {
  tyre_front_left: "Front Left Tyre",
  tyre_rear_left: "Rear Left Tyre",
  tyre_rear_right: "Rear Right Tyre",
  tyre_front_right: "Front Right Tyre",
  tyre_spare: "Spare Tyre",
};

const photoCount = 5;
const issueOptions = [
  "Worn Tread",
  "Puncture",
  "Sidewall Damage",
  "Uneven Wear",
  "No Issue",
];

const TyreCard = ({
  tyreName,
  tyreKey,
  brand,
  subBrand,
  variant,
  size,
  manufacturingDate,
  threadDepth,
  issue,
  photos,
  onBrandChange,
  onSubBrandChange,
  onVariantChange,
  onSizeChange,
  onManufacturingDateChange,
  onThreadDepthChange,
  onIssueChange,
  onPhotoChange,
  setShowPhoto,
  idx,
}) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [issueDropdownOpen, setIssueDropdownOpen] = useState(false);
  const photoDropdownRef = useRef(null); //change
  const issueDropdownRef = useRef(null); //change

  useEffect(() => {
    //change
    const handleClickOutside = (event) => {
      if (
        photoDropdownRef.current &&
        !photoDropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
      if (
        issueDropdownRef.current &&
        !issueDropdownRef.current.contains(event.target)
      ) {
        setIssueDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const toggleDropdown = () => setShowDropdown((curr) => !curr);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const uploadedData = await FileUploaderService.uploadFileToServer(
          file,
          tyreKey
        );
        const imageUrl = uploadedData.files?.[0]?.fileUrl || null;
        if (imageUrl) {
          const emptyIndex = photos.findIndex((p) => !p);
          if (emptyIndex !== -1) {
            onPhotoChange(emptyIndex, imageUrl);
          }
          setShowDropdown(false);
        }
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload image. Try again.");
      }
    }
  };

  const handleCameraClick = async () => {
    if (!isCameraActive) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = s;
        setStream(s);
        setIsCameraActive(true);
      } catch {
        alert("Camera not available.");
      }
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

      // ✅ convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            // make a File object from the blob
            const file = new File([blob], "captured.png", {
              type: "image/png",
            });

            // upload to server
            const uploadedData = await FileUploaderService.uploadFileToServer(
              file,
              tyreKey
            );
            const imageUrl = uploadedData.files?.[0]?.fileUrl || null;

            if (imageUrl) {
              const emptyIndex = photos.findIndex((p) => !p);
              if (emptyIndex !== -1) {
                onPhotoChange(emptyIndex, imageUrl);
              }
            }
          } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload image. Try again.");
          }
        }
      }, "image/png");

      // stop camera
      stream?.getTracks().forEach((t) => t.stop());
      setStream(null);
      setIsCameraActive(false);
      setShowDropdown(false);
    }
  };

  const toggleIssueOption = (option) => {
    let updated = [...(issue || [])];
    if (updated.includes(option)) {
      updated = updated.filter((i) => i !== option);
    } else {
      updated.push(option);
    }
    onIssueChange(updated);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg sm:text-xl font-bold mb-4 text-white text-left">
        {`${idx + 1}. ${tyreName}`}
      </h3>

      {/* Brand */}
      <div>
        <label className="text-sm text-white font-medium mb-1 block">
          Brand
        </label>
        <select
          value={brand || ""}
          onChange={onBrandChange}
          className="p-2 bg-gray-800 text-white border border-green-200 rounded-md w-full"
        >
          <option value="">Select Brand</option>
          <option value="Michelin">Michelin</option>
          <option value="Bridgestone">Bridgestone</option>
          <option value="Goodyear">Goodyear</option>
          <option value="Pirelli">Pirelli</option>
          <option value="Continental">Continental</option>
        </select>
      </div>

      {/* Sub-Brand */}
      <div>
        <label className="text-sm text-white font-medium mb-1 block">
          Sub-Brand
        </label>
        <select
          value={subBrand || ""}
          onChange={onSubBrandChange}
          className="p-2 bg-gray-800 text-white border border-green-200 rounded-md w-full"
        >
          <option value="">Select Sub-Brand</option>
          <option value="Pilot Sport">Pilot Sport</option>
          <option value="Turanza">Turanza</option>
          <option value="Eagle F1">Eagle F1</option>
          <option value="P Zero">P Zero</option>
          <option value="ContiSportContact">ContiSportContact</option>
        </select>
      </div>

      {/* Variant */}
      <div>
        <label className="text-sm text-white font-medium mb-1 block">
          Variant
        </label>
        <select
          value={variant || ""}
          onChange={onVariantChange}
          className="p-2 bg-gray-800 text-white border border-green-200 rounded-md w-full"
        >
          <option value="">Select Variant</option>
          <option value="Sport">Sport</option>
          <option value="All-Season">All-Season</option>
          <option value="Winter">Winter</option>
          <option value="Performance">Performance</option>
          <option value="Touring">Touring</option>
          <option value="Eco">Eco</option>
          <option value="Mud-Terrain">Mud-Terrain</option>
        </select>
      </div>

      {/* Size */}
      <div>
        <label className="text-sm text-white font-medium mb-1 block">
          Size
        </label>
        <input
          type="text"
          value={size || ""}
          onChange={onSizeChange}
          placeholder="Enter tyre size"
          className="w-full p-2 border border-white/20 rounded bg-[#ffffff0a] text-white"
        />
      </div>

      {/* Manufacturing Date */}
      <div>
        <label className="text-sm text-white font-medium mb-1 block">
          Manufacturing Date (MM/YY)
        </label>
        <input
          type="text"
          value={manufacturingDate || ""}
          onChange={onManufacturingDateChange}
          placeholder="MM/YY"
          className="w-full p-2 border border-white/20 rounded bg-[#ffffff0a] text-white"
        />
      </div>

      {/* Thread Depth */}
      <div>
        <label className="text-sm text-white font-medium mb-1 block">
          Thread Depth (mm)
        </label>
        <input
          type="text"
          value={threadDepth || ""}
          onChange={onThreadDepthChange}
          placeholder="Enter thread depth"
          className="w-full p-2 border border-white/20 rounded bg-[#ffffff0a] text-white"
        />
      </div>

      {/* Issue (Multi-select with checkboxes) */}
      <div className="relative" ref={issueDropdownRef}>
        <label className="text-sm text-white font-medium mb-1 block">
          Issue
        </label>
        <div
          className="p-2 bg-gray-800 text-white border border-green-200 rounded-md w-full cursor-pointer"
          onClick={() => setIssueDropdownOpen((prev) => !prev)}
        >
          {issue && issue.length > 0 ? issue.join(", ") : "Select Issue"}
        </div>

        {issueDropdownOpen && (
          <div className="absolute z-10 mt-1 bg-gray-800 border border-green-200 rounded-md w-full max-h-60 overflow-y-auto">
            {issueOptions.map((opt) => (
              <label
                key={opt}
                className="flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer text-white"
              >
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={issue?.includes(opt)}
                  onChange={() => toggleIssueOption(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Photos */}
      {issue && issue.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-4 items-center">
          {photos.map(
            (photoUrl, i) =>
              photoUrl && (
                <div key={i} className="relative">
                  <img
                    src={photoUrl}
                    alt={`Photo ${i + 1}`}
                    className="w-24 h-24 object-cover rounded-md cursor-pointer"
                    onClick={() => setShowPhoto(photoUrl)}
                  />
                </div>
              )
          )}

          {/* Plus button */}
          {photos.filter((p) => p).length < photoCount && (
            <div className="relative w-24 h-24 flex items-center justify-center rounded-md">
              <button
                onClick={toggleDropdown}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-500 text-white text-2xl hover:bg-gray-600"
              >
                <AiOutlinePlus />
              </button>

              {showDropdown && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md shadow-lg z-10 w-48">
                  <button
                    onClick={handleCameraClick}
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
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            className={isCameraActive ? "w-24 h-24 rounded-md" : "hidden"}
          />
        </div>
      )}
    </div>
  );
};

const Tyres = ({ data = {}, onChange }) => {
  const tyreKeys = [
    "tyre_front_left",
    "tyre_rear_left",
    "tyre_rear_right",
    "tyre_front_right",
    "tyre_spare",
  ];
  const [autoCopiedFields, setAutoCopiedFields] = useState({});
  const [showPhoto, setShowPhoto] = useState(null);

  const [tyreState, setTyreState] = useState(() => {
    const initial = {};
    tyreKeys.forEach((key) => {
      initial[key] = {
        brand: data[`${key}_brand`] || "",
        subBrand: data[`${key}_subBrand`] || "",
        variant: data[`${key}_variant`] || "",
        size: data[`${key}_size`] || "",
        manufacturingDate: data[`${key}_manufacturingDate`] || "",
        threadDepth: data[`${key}_treadDepth`] || "",
        issue: Array.isArray(data[`${key}_issue`]) ? data[`${key}_issue`] : [],
        photos: Array.isArray(data[`${key}_imageUrls`])
          ? data[`${key}_imageUrls`]
              .slice(0, photoCount)
              .concat(Array(photoCount).fill(null))
              .slice(0, photoCount)
          : Array(photoCount).fill(null),
        ...(key === "tyre_spare" ? { toggle: !!data[`${key}_toggle`] } : {}),
      };
    });
    return initial;
  });

  const handleFieldChange = (tyreKey, field) => (e) => {
    const value = Array.isArray(e) ? e : e.target.value;

    setTyreState((prev) => {
      const updated = { ...prev };
      updated[tyreKey][field] = value;

      if (tyreKey === "tyre_front_left" && !autoCopiedFields[field]) {
        ["tyre_rear_left", "tyre_rear_right", "tyre_front_right"].forEach(
          (key) => {
            updated[key][field] = value;
          }
        );
        setAutoCopiedFields((prevFields) => ({ ...prevFields, [field]: true }));
      }

      return updated;
    });

    if (onChange) onChange(`${tyreKey}_${field}`, value);
  };

  const handleThreadDepthChange = (tyreKey) => (e) => {
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      setTyreState((prev) => {
        const updated = { ...prev };
        updated[tyreKey].threadDepth = val;
        return updated;
      });
      if (onChange) onChange(`${tyreKey}_treadDepth`, val);
    }
  };

  const handlePhotoChange = (tyreKey) => (index, url) => {
    setTyreState((prev) => {
      const updated = { ...prev };
      const newPhotos = [...updated[tyreKey].photos];
      newPhotos[index] = url;
      updated[tyreKey].photos = newPhotos;
      return updated;
    });
    if (onChange) {
      const newArr = [...tyreState[tyreKey].photos];
      newArr[index] = url;
      onChange(`${tyreKey}_imageUrls`, newArr);
    }
  };

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white text-left">
        Tyres
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {tyreKeys.map((key, idx) => (
          <React.Fragment key={key}>
            {key === "tyre_spare" && (
              <div className="mb-4 flex items-center">
                <label className="text-white font-medium mr-2">
                  Spare Tyre Present
                </label>
                <input
                  type="checkbox"
                  checked={!!tyreState[key].toggle}
                  onChange={(e) => {
                    setTyreState((prev) => ({
                      ...prev,
                      [key]: { ...prev[key], toggle: e.target.checked },
                    }));
                    if (onChange) onChange(`${key}_toggle`, e.target.checked);
                  }}
                  className="form-checkbox h-5 w-5 text-lime-500"
                />
              </div>
            )}
            {key !== "tyre_spare" || tyreState[key].toggle ? (
              <TyreCard
                tyreKey={key}
                tyreName={labelNames[key]}
                brand={tyreState[key].brand}
                subBrand={tyreState[key].subBrand}
                variant={tyreState[key].variant}
                size={tyreState[key].size}
                manufacturingDate={tyreState[key].manufacturingDate}
                threadDepth={tyreState[key].threadDepth}
                issue={tyreState[key].issue}
                photos={tyreState[key].photos}
                onBrandChange={handleFieldChange(key, "brand")}
                onSubBrandChange={handleFieldChange(key, "subBrand")}
                onVariantChange={handleFieldChange(key, "variant")}
                onSizeChange={handleFieldChange(key, "size")}
                onManufacturingDateChange={handleFieldChange(
                  key,
                  "manufacturingDate"
                )}
                onThreadDepthChange={handleThreadDepthChange(key)}
                onIssueChange={handleFieldChange(key, "issue")}
                onPhotoChange={handlePhotoChange(key)}
                setShowPhoto={setShowPhoto}
                idx={idx}
              />
            ) : null}
          </React.Fragment>
        ))}
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

export default Tyres;


