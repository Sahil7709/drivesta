import React, { useState, useEffect, useRef, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, isAfter } from "date-fns";
import { AiOutlinePlus, AiOutlineCamera, AiOutlineUpload } from "react-icons/ai";
import FileUploaderService from "../../../services/upload-document.service";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";
import ServerUrl from "../../../core/constants/serverUrl.constant";

const TYRE_LABELS = {
  tyre_front_left: "Front Left Tyre",
  tyre_rear_left: "Rear Left Tyre",
  tyre_rear_right: "Rear Right Tyre",
  tyre_front_right: "Front Right Tyre",
  tyre_spare: "Spare Tyre",
};

const PHOTO_LIMIT = 5;

const issues_OPTIONS = [
  "Worn thread",
  "Puncture",
  "Sidewall Damage",
  "Uneven Wear",
  "No issues",
];

const BRAND_OPTIONS = [
  "Michelin",
  "Bridgestone",
  "CEAT",
  "Apollo",
  "Goodyear",
  "Pirelli",
  "Continental",
  "Other",
];
const SUB_BRAND_OPTIONS = [
  "Pilot Sport",
  "Turanza",
  "Eagle F1",
  "EnergyDrive",
  "Alanc 4G",
  "P Zero",
  "ContiSportContact",
  "EfficientGrip",
  "Other",
];
const VARIANT_OPTIONS = [
  "Sport",
  "All-Season",
  "Winter",
  "EnergyDrive",
  "Alanc 4G",
  "Performance",
  "Touring",
  "Eco",
  "Mud-Terrain",
  "EfficientGrip",
  "Other",
];

const Tyres = ({ data = {}, onChange }) => {
  const tyreKeys = Object.keys(TYRE_LABELS);
  const [tyreState, setTyreState] = useState({});
  const [showDropdown, setShowDropdown] = useState(null);
  const [issueSearch, setIssueSearch] = useState({});
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [autoCopied, setAutoCopied] = useState({});

  const dropdownRefs = useRef({});

  useEffect(() => {
    const initial = {};
    tyreKeys.forEach((key) => {
      initial[key] = {
        brand: data[`${key}_brand`] || "",
        subBrand: data[`${key}_subBrand`] || "",
        variant: data[`${key}_variant`] || "",
        size: data[`${key}_size`] || "",
        manufacturingDate: data[`${key}_manufacturingDate`] || "",
        threadDepth: data[`${key}_threadDepth`] || "",
        issues: Array.isArray(data[`${key}_issues`]) ? data[`${key}_issues`] : [],
        photos: Array.isArray(data[`${key}_imageUrls`])
          ? data[`${key}_imageUrls`].slice(0, PHOTO_LIMIT)
          : [],
        ...(key === "tyre_spare" ? { toggle: !!data[`${key}_toggle`] } : {}),
      };
    });
    setTyreState(initial);
  }, [data]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && dropdownRefs.current[showDropdown] && !dropdownRefs.current[showDropdown].contains(event.target)) {
        setShowDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleFieldChange = (tyreKey, field, value) => {
    setTyreState((prev) => {
      const updated = { ...prev, [tyreKey]: { ...prev[tyreKey] } };

      if (field === "photos") {
        updated[tyreKey].photos = value;
        onChange?.(`${tyreKey}_imageUrls`, value);
      } else {
        updated[tyreKey][field] = value;

        // Auto-copy only specific fields (once, from front left)
        const autoCopyFields = ["brand", "subBrand", "variant", "size"];
        if (
          tyreKey === "tyre_front_left" &&
          autoCopyFields.includes(field) &&
          !autoCopied[field]
        ) {
          ["tyre_rear_left", "tyre_rear_right", "tyre_front_right"].forEach(
            (k) => {
              updated[k][field] = value;
              onChange?.(`${k}_${field}`, value);
            }
          );
          setAutoCopied((p) => ({ ...p, [field]: true }));
        }

        onChange?.(`${tyreKey}_${field}`, value);
      }

      return updated;
    });
  };

  const handleConditionChange = (tyreKey, issue) => {
    setTyreState((prev) => {
      const current = prev[tyreKey].issues || [];
      const updated = current.includes(issue) ? current.filter((i) => i !== issue) : [...current, issue];
      handleFieldChange(tyreKey, "issues", updated);
      return { ...prev, [tyreKey]: { ...prev[tyreKey], issues: updated } };
    });
  };

  const compressImage = async (file) => {
    try {
      return await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true });
    } catch {
      return file;
    }
  };

  const handleFileSelect = async (e, tyreKey) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return toast.error("Select a valid image");
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setActivePanel(tyreKey);
    setShowDropdown(null);
  };

  const handleCancel = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
    setActivePanel(null);
  };

  const handleConfirm = async () => {
    if (!previewFile || !activePanel) return;
    try {
      const compressed = await compressImage(previewFile);
      const uploaded = await FileUploaderService.uploadFileToServer(compressed, activePanel);
      const imageUrl = uploaded.files?.[0]?.fileUrl;
      if (!imageUrl) throw new Error("Upload failed");

      setTyreState((prev) => {
        const arr = prev[activePanel].photos ? [...prev[activePanel].photos, imageUrl] : [imageUrl];
        const limitedArr = arr.slice(0, PHOTO_LIMIT);
        handleFieldChange(activePanel, "photos", limitedArr);
        return { ...prev, [activePanel]: { ...prev[activePanel], photos: limitedArr } };
      });
    } catch {
      toast.error("Upload failed");
    } finally {
      handleCancel();
    }
  };

  const toggleDropdown = (panel) => setShowDropdown((curr) => (curr === panel ? null : panel));

  // Helper to parse MM/YY to Date
  const parseMMYY = (str) => {
    if (!str) return null;
    const [mm, yy] = str.split("/");
    if (!mm || !yy) return null;
    return new Date(`20${yy.length === 2 ? yy : "00"}`, Number(mm) - 1, 1);
  };

  // Custom input for DatePicker to make it read-only
  const ReadOnlyInput = forwardRef(({ value, onClick, placeholder, className }, ref) => (
    <input
      value={value}
      onClick={onClick}
      placeholder={placeholder}
      className={className}
      readOnly
      ref={ref}
      style={{ cursor: "pointer", backgroundColor: "#ffffff0a", color: "#fff" }}
    />
  ));

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">Tyres</h2>
      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {tyreKeys.map((tyreKey, idx) => {
          const tyreData = tyreState[tyreKey] || {};
          const panelEnabled = tyreKey !== "tyre_spare" || tyreData.toggle;
          const selectedIssues = tyreData.issues || [];
          const filteredIssues = issues_OPTIONS.filter((i) =>
            i.toLowerCase().includes((issueSearch[tyreKey] || "").toLowerCase())
          );
          const photosArr = tyreData.photos || [];

          return (
            <React.Fragment key={tyreKey}>
              {tyreKey === "tyre_spare" && (
                <div className="mb-4 flex items-center">
                  <label className="text-white font-medium mr-2">
                    Spare Tyre Present
                  </label>
                  <input
                    type="checkbox"
                    checked={!!tyreData.toggle}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setTyreState((prev) => ({
                        ...prev,
                        [tyreKey]: { ...prev[tyreKey], toggle: checked },
                      }));
                      onChange?.(`${tyreKey}_toggle`, checked);
                    }}
                    className="form-checkbox h-5 w-5 text-lime-500"
                  />
                </div>
              )}
              {panelEnabled && (
                <div className="flex flex-col w-full relative border-b border-white/20 pb-4 mb-4">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 text-white text-left">
                    {`${idx + 1}. ${TYRE_LABELS[tyreKey]}`}
                  </h3>
                  {/* Brand */}
                  <SelectField
                    label="Brand"
                    value={tyreData.brand}
                    options={BRAND_OPTIONS}
                    onChange={(v) => handleFieldChange(tyreKey, "brand", v)}
                  />
                  {/* Sub-Brand */}
                  <SelectField
                    label="Sub-Brand"
                    value={tyreData.subBrand}
                    options={SUB_BRAND_OPTIONS}
                    onChange={(v) => handleFieldChange(tyreKey, "subBrand", v)}
                  />
                  {/* Variant */}
                  <SelectField
                    label="Variant"
                    value={tyreData.variant}
                    options={VARIANT_OPTIONS}
                    onChange={(v) => handleFieldChange(tyreKey, "variant", v)}
                  />
                  {/* Size */}
                  <InputField
                    label="Size"
                    placeholder="Enter tyre size"
                    value={tyreData.size}
                    onChange={(v) => handleFieldChange(tyreKey, "size", v)}
                  />
                  {/* Manufacturing Date */}
                  <div>
                    <label className="text-sm text-white font-medium mb-1 block">
                      Manufacturing Date (MM/YY)
                    </label>
                    <DatePicker
                      selected={parseMMYY(tyreData.manufacturingDate)}
                      onChange={(date) => {
                        if (!date) return;
                        const now = new Date();
                        // Prevent future dates
                        if (isAfter(date, now)) return;
                        const mm = String(date.getMonth() + 1).padStart(2, "0");
                        const yy = String(date.getFullYear()).slice(-2);
                        handleFieldChange(tyreKey, "manufacturingDate", `${mm}/${yy}`);
                      }}
                      dateFormat="MM/yy"
                      showMonthYearPicker
                      maxDate={new Date()}
                      placeholderText="MM/YY"
                      customInput={
                        <ReadOnlyInput className="w-full p-2 border border-white/20 rounded bg-[#ffffff0a] text-white" />
                      }
                    />
                  </div>
                  {/* Thread Depth */}
                  <InputField
                    label="Thread Depth (mm)"
                    placeholder="Enter thread depth"
                    value={tyreData.threadDepth}
                    onChange={(v) => handleFieldChange(tyreKey, "threadDepth", v)}
                    validate={(val) => /^\d*\.?\d*$/.test(val)}
                  />
                  {/* Issues Dropdown */}
                  <div className="mb-4 relative" ref={(el) => (dropdownRefs.current[tyreKey] = el)}>
                    <button
                      type="button"
                      onClick={() => toggleDropdown(tyreKey)}
                      className="w-full bg-gray-800 text-white p-2 rounded-md flex justify-between items-center focus:outline-none"
                    >
                      {selectedIssues.length > 0 ? selectedIssues.join(", ") : "Select Issues"}
                      <span className="ml-2">&#9662;</span>
                    </button>
                    {showDropdown === tyreKey && (
                      <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-white/20 rounded-md shadow-lg max-h-48 overflow-auto p-2">
                        <input
                          type="text"
                          value={issueSearch[tyreKey] || ""}
                          onChange={(e) => setIssueSearch((prev) => ({ ...prev, [tyreKey]: e.target.value }))}
                          placeholder="Search issues..."
                          className="w-full p-2 mb-2 rounded-md bg-gray-700 text-white focus:outline-none"
                        />
                        {filteredIssues.map((issue) => (
                          <label
                            key={issue}
                            className="flex items-center gap-2 px-2 py-1 cursor-pointer text-white hover:bg-gray-700 rounded-md"
                          >
                            <input
                              type="checkbox"
                              checked={selectedIssues.includes(issue)}
                              onChange={() => handleConditionChange(tyreKey, issue)}
                              className="w-4 h-4"
                            />
                            {issue}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Photos */}
                  {selectedIssues.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-4">
                      {photosArr.map(
                        (photo, i) =>
                          photo && (
                            <img
                              key={i}
                              src={`${ServerUrl.IMAGE_URL}${photo}`}
                              alt={`${tyreKey} photo ${i + 1}`}
                              className="w-24 h-24 object-cover rounded-md cursor-pointer"
                              onClick={() => {
                                setPreviewUrl(photo);
                                setActivePanel(tyreKey);
                              }}
                            />
                          )
                      )}
                      {photosArr.length < PHOTO_LIMIT && (
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <button
                            onClick={() => toggleDropdown(`${tyreKey}-photo`)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-500 hover:bg-gray-600 text-white text-xl"
                          >
                            <AiOutlinePlus />
                          </button>
                          {showDropdown === `${tyreKey}-photo` && (
                            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md shadow-lg z-10 w-48 p-2">
                              <label className="flex items-center px-4 py-3 w-full cursor-pointer hover:bg-gray-700">
                                <AiOutlineCamera className="mr-2" /> Take Photo
                                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileSelect(e, tyreKey)} />
                              </label>
                              <label className="flex items-center px-4 py-3 w-full cursor-pointer hover:bg-gray-700">
                                <AiOutlineUpload className="mr-2" /> Upload Photo
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, tyreKey)} />
                              </label>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/60" onClick={handleCancel}></div>
          <div className="relative bg-gray-900 rounded-lg p-6 w-96 text-center z-50">
            <h3 className="text-lg font-semibold mb-4">Preview Photo</h3>
            <img src={previewUrl} alt="Preview" className="w-full h-64 object-contain rounded-md mb-4" />
            <div className="flex justify-between">
              <button onClick={handleCancel} className="px-4 py-2 bg-gray-600 rounded-md">Cancel</button>
              <button onClick={handleConfirm} className="px-4 py-2 bg-green-600 rounded-md">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, placeholder, value, onChange, validate }) => (
  <div>
    <label className="text-sm text-white font-medium mb-1 block">{label}</label>
    <input
      type="text"
      value={value || ""}
      placeholder={placeholder}
      onChange={(e) =>
        (!validate || validate(e.target.value)) && onChange(e.target.value)
      }
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

export default Tyres;