import React, { useState, useEffect, useRef } from "react";
import { AiOutlinePlus, AiOutlineCamera, AiOutlineUpload } from "react-icons/ai";
import FileUploaderService from "../../../services/upload-document.service";
import FullScreenPhotoViewer from "../report/FullScreenPhotoViewer";
import ServerUrl from "../../../core/constants/serverUrl.constant";

// ---------------- Constants ----------------
const TYRE_LABELS = {
  tyre_front_left: "Front Left Tyre",
  tyre_rear_left: "Rear Left Tyre",
  tyre_rear_right: "Rear Right Tyre",
  tyre_front_right: "Front Right Tyre",
  tyre_spare: "Spare Tyre",
};

const PHOTO_LIMIT = 5;

const ISSUE_OPTIONS = [
  "Worn Tread",
  "Puncture",
  "Sidewall Damage",
  "Uneven Wear",
  "No Issue",
];

const BRAND_OPTIONS = ["Michelin", "Bridgestone", "Goodyear", "Pirelli", "Continental"];
const SUB_BRAND_OPTIONS = ["Pilot Sport", "Turanza", "Eagle F1", "P Zero", "ContiSportContact"];
const VARIANT_OPTIONS = [
  "Sport",
  "All-Season",
  "Winter",
  "Performance",
  "Touring",
  "Eco",
  "Mud-Terrain",
];

// ---------------- Tyre Card ----------------
const TyreCard = ({
  tyreKey,
  tyreName,
  tyreData,
  onFieldChange,
  onPhotoChange,
  setShowPhoto,
  idx,
}) => {
  const { brand, subBrand, variant, size, manufacturingDate, threadDepth, issue, photos } = tyreData;

  const videoRef = useRef(null);
  const photoDropdownRef = useRef(null);
  const issueDropdownRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [issueDropdownOpen, setIssueDropdownOpen] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (photoDropdownRef.current && !photoDropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (issueDropdownRef.current && !issueDropdownRef.current.contains(e.target)) {
        setIssueDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Stop camera when unmounting
  useEffect(() => {
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [stream]);

  const toggleDropdown = () => setShowDropdown((curr) => !curr);

  // -------- File Upload --------
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    try {
      const uploaded = await FileUploaderService.uploadFileToServer(file, tyreKey);
      const imageUrl = uploaded.files?.[0]?.fileUrl || null;
      if (imageUrl) {
        const emptyIndex = photos.findIndex((p) => !p);
        if (emptyIndex !== -1) {
          onPhotoChange(tyreKey, emptyIndex, `${ServerUrl.IMAGE_URL}${imageUrl}`);
        }
      }
      setShowDropdown(false);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image. Try again.");
    }
  };

  // -------- Camera Capture --------
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
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const file = new File([blob], "captured.png", { type: "image/png" });
        const uploaded = await FileUploaderService.uploadFileToServer(file, tyreKey);
        const imageUrl = uploaded.files?.[0]?.fileUrl || null;

        if (imageUrl) {
          const emptyIndex = photos.findIndex((p) => !p);
          if (emptyIndex !== -1) {
            onPhotoChange(tyreKey, emptyIndex, `${ServerUrl.IMAGE_URL}${imageUrl}`);
          }
        }
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to upload image. Try again.");
      }
    }, "image/png");

    // stop camera
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsCameraActive(false);
    setShowDropdown(false);
  };

  // -------- Toggle Issues --------
  const toggleIssueOption = (opt) => {
    let updated = [...(issue || [])];
    updated = updated.includes(opt) ? updated.filter((i) => i !== opt) : [...updated, opt];
    onFieldChange(tyreKey, "issue", updated);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg sm:text-xl font-bold mb-4 text-white text-left">
        {`${idx + 1}. ${tyreName}`}
      </h3>

      {/* Brand */}
      <SelectField label="Brand" value={brand} options={BRAND_OPTIONS} onChange={(v) => onFieldChange(tyreKey, "brand", v)} />

      {/* Sub-Brand */}
      <SelectField label="Sub-Brand" value={subBrand} options={SUB_BRAND_OPTIONS} onChange={(v) => onFieldChange(tyreKey, "subBrand", v)} />

      {/* Variant */}
      <SelectField label="Variant" value={variant} options={VARIANT_OPTIONS} onChange={(v) => onFieldChange(tyreKey, "variant", v)} />

      {/* Size */}
      <InputField label="Size" placeholder="Enter tyre size" value={size} onChange={(v) => onFieldChange(tyreKey, "size", v)} />

      {/* Manufacturing Date */}
      <InputField label="Manufacturing Date (MM/YY)" placeholder="MM/YY" value={manufacturingDate} onChange={(v) => onFieldChange(tyreKey, "manufacturingDate", v)} />

      {/* Thread Depth */}
      <InputField label="Thread Depth (mm)" placeholder="Enter thread depth" value={threadDepth} onChange={(v) => onFieldChange(tyreKey, "threadDepth", v)} validate={(val) => /^\d*\.?\d*$/.test(val)} />

      {/* Issues */}
      <div className="relative" ref={issueDropdownRef}>
        <label className="text-sm text-white font-medium mb-1 block">Issue</label>
        <div
          className="p-2 bg-gray-800 text-white border border-green-200 rounded-md w-full cursor-pointer"
          onClick={() => setIssueDropdownOpen((p) => !p)}
        >
          {issue?.length > 0 ? issue.join(", ") : "Select Issue"}
        </div>
        {issueDropdownOpen && (
          <div className="absolute z-10 mt-1 bg-gray-800 border border-green-200 rounded-md w-full max-h-60 overflow-y-auto">
            {ISSUE_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer text-white">
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
      {issue?.length > 0 && (
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

          {photos.filter((p) => p).length < PHOTO_LIMIT && (
            <div className="relative w-24 h-24 flex items-center justify-center rounded-md" ref={photoDropdownRef}>
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
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              )}
            </div>
          )}

          <video ref={videoRef} autoPlay className={isCameraActive ? "w-24 h-24 rounded-md" : "hidden"} />
        </div>
      )}
    </div>
  );
};

// ---------------- Reusable Fields ----------------
const InputField = ({ label, placeholder, value, onChange, validate }) => (
  <div>
    <label className="text-sm text-white font-medium mb-1 block">{label}</label>
    <input
      type="text"
      value={value || ""}
      placeholder={placeholder}
      onChange={(e) => (!validate || validate(e.target.value)) && onChange(e.target.value)}
      className="w-full p-2 border border-white/20 rounded bg-[#ffffff0a] text-white"
    />
  </div>
);

const SelectField = ({ label, value, options, onChange }) => (
  <div>
    <label className="text-sm text-white font-medium mb-1 block">{label}</label>
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="p-2 bg-gray-800 text-white border border-green-200 rounded-md w-full"
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

// ---------------- Tyres Wrapper ----------------
const Tyres = ({ data = {}, onChange }) => {
  const tyreKeys = Object.keys(TYRE_LABELS);
  const [showPhoto, setShowPhoto] = useState(null);
  const [autoCopied, setAutoCopied] = useState({});
  const [tyreState, setTyreState] = useState(() => {
    const initial = {};
    tyreKeys.forEach((key) => {
      initial[key] = {
        brand: data[`${key}_brand`] || "",
        subBrand: data[`${key}_subBrand`] || "",
        variant: data[`${key}_variant`] || "",
        size: data[`${key}_size`] || "",
        manufacturingDate: data[`${key}_manufacturingDate`] || "",
        treadDepth: data[`${key}_treadDepth`] || "",
        issue: Array.isArray(data[`${key}_issue`]) ? data[`${key}_issue`] : [],
        photos: Array.isArray(data[`${key}_imageUrls`])
          ? data[`${key}_imageUrls`].slice(0, PHOTO_LIMIT).concat(Array(PHOTO_LIMIT).fill(null)).slice(0, PHOTO_LIMIT)
          : Array(PHOTO_LIMIT).fill(null),
        ...(key === "tyre_spare" ? { toggle: !!data[`${key}_toggle`] } : {}),
      };
    });
    return initial;
  });

  // Universal field handler
  const handleFieldChange = (tyreKey, field, value) => {
    setTyreState((prev) => {
      const updated = { ...prev, [tyreKey]: { ...prev[tyreKey] } };

      if (field === "photos") {
        updated[tyreKey].photos = value;
        onChange?.(`${tyreKey}_imageUrls`, value);
      } else {
        updated[tyreKey][field] = value;

        if (tyreKey === "tyre_front_left" && !autoCopied[field]) {
          ["tyre_rear_left", "tyre_rear_right", "tyre_front_right"].forEach((k) => {
            updated[k][field] = value;
          });
          setAutoCopied((p) => ({ ...p, [field]: true }));
        }

        onChange?.(`${tyreKey}_${field}`, value);
      }

      return updated;
    });
  };

  const handlePhotoChange = (tyreKey, index, url) => {
    setTyreState((prev) => {
      const updated = { ...prev, [tyreKey]: { ...prev[tyreKey] } };
      const newPhotos = [...updated[tyreKey].photos];
      newPhotos[index] = url;
      updated[tyreKey].photos = newPhotos;
      onChange?.(`${tyreKey}_imageUrls`, newPhotos);
      return updated;
    });
  };

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">Tyres</h2>
      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {tyreKeys.map((key, idx) => (
          <React.Fragment key={key}>
            {key === "tyre_spare" && (
              <div className="mb-4 flex items-center">
                <label className="text-white font-medium mr-2">Spare Tyre Present</label>
                <input
                  type="checkbox"
                  checked={!!tyreState[key].toggle}
                  onChange={(e) =>
                    setTyreState((prev) => ({
                      ...prev,
                      [key]: { ...prev[key], toggle: e.target.checked },
                    }))
                  }
                  className="form-checkbox h-5 w-5 text-lime-500"
                />
              </div>
            )}
            {key !== "tyre_spare" || tyreState[key].toggle ? (
              <TyreCard
                tyreKey={key}
                tyreName={TYRE_LABELS[key]}
                tyreData={tyreState[key]}
                onFieldChange={handleFieldChange}
                onPhotoChange={handlePhotoChange}
                setShowPhoto={setShowPhoto}
                idx={idx}
              />
            ) : null}
          </React.Fragment>
        ))}
      </div>
      {showPhoto && <FullScreenPhotoViewer photo={showPhoto} onClose={() => setShowPhoto(null)} />}
    </div>
  );
};

export default Tyres;
