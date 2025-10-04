import React, { useState, useEffect } from "react";
import { AiOutlinePlus, AiOutlineCamera, AiOutlineUpload } from "react-icons/ai";
import FileUploaderService from "../../../services/upload-document.service";
import imageCompression from "browser-image-compression";
import ServerUrl from "../../../core/constants/serverUrl.constant";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BasicDetails = ({ data, onChange }) => {
  const fields = ["vinNumber", "engineNumber", "odo", "keys"];

  const fieldLabels = {
    vinNumber: "VIN Number",
    engineNumber: "Engine Number",
    odo: "ODO",
    keys: "Keys",
    manufacturingDate: "Manufacturing Date",
  };

  const [photos, setPhotos] = useState(
    fields.reduce(
      (acc, field) => ({
        ...acc,
        [field]: data?.[`${field}_imageUrl`] || null,
      }),
      {}
    )
  );

  const [showDropdown, setShowDropdown] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeField, setActiveField] = useState(null);
  const [manufacturingDate, setManufacturingDate] = useState(null);

  useEffect(() => {
    const updatedPhotos = fields.reduce(
      (acc, field) => ({ ...acc, [field]: data?.[`${field}_imageUrl`] || null }),
      {}
    );
    setPhotos(updatedPhotos);

    if (data?.manufacturingDate) {
      setManufacturingDate(data.manufacturingDate);
    }
  }, [data]);

  const toggleDropdown = (field) =>
    setShowDropdown(showDropdown === field ? null : field);

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

  const handleFileSelect = (e, field) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      return alert("Please select a valid image file.");
    }
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setActiveField(field);
    setShowDropdown(null);
  };

  const handleCancel = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
    setActiveField(null);
  };

  const handleConfirm = async () => {
    if (!previewFile || !activeField) return;

    try {
      const compressedFile = await compressImage(previewFile);
      const uploadedData = await FileUploaderService.uploadFileToServer(
        compressedFile,
        activeField
      );
      const imageUrl = uploadedData?.files?.[0]?.fileUrl || null;

      if (imageUrl) {
        setPhotos((prev) => ({ ...prev, [activeField]: imageUrl }));
        onChange(`${activeField}_imageUrl`, imageUrl);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      handleCancel();
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    if (name === "vinNumber" || name === "engineNumber") {
      newValue = newValue.toUpperCase().replace(/[^A-Z0-9]/g, "");
    } else if (name === "odo" || name === "keys") {
      newValue = newValue.replace(/[^0-9]/g, "");
    }

    onChange(name, newValue);
  };

  const handleManufacturingDateChange = (date) => {
    if (!date) return;
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    const value = `${mm}/${yy}`;
    setManufacturingDate(value);
    onChange && onChange("manufacturingDate", value);
  };

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl mx-auto text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Basic Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {fields.map((field) => (
          <div key={field} className="flex flex-col">
            <label className="text-md text-white font-medium mb-2">
              {fieldLabels[field]}
            </label>
            <input
              type="text"
              name={field}
              value={data[field] || ""}
              onChange={handleInputChange}
              className="p-3 bg-transparent text-white border border-green-200 shadow-inner rounded-md w-full focus:outline-none focus:ring-2 focus:ring-lime-400 mb-2"
              placeholder={`Enter ${fieldLabels[field]}`}
            />

            <div className="relative">
              {photos[field] ? (
                <img
                  src={`${ServerUrl.IMAGE_URL}${photos[field]}`}
                  alt={`${fieldLabels[field]} Photo`}
                  className="w-20 h-20 object-cover rounded-md cursor-pointer"
                  onClick={() =>
                    setPreviewUrl(`${ServerUrl.IMAGE_URL}${photos[field]}`)
                  }
                />
              ) : (
                <button
                  onClick={() => toggleDropdown(field)}
                  className="p-2 rounded-full bg-gray-500 text-white hover:bg-opacity-80"
                >
                  <AiOutlinePlus className="text-xl" />
                </button>
              )}

              {showDropdown === field && (
                <div className="absolute top-10 left-0 bg-gray-800 rounded-md shadow-lg z-10 w-40">
                  <label className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer w-full">
                    <AiOutlineCamera className="mr-2" /> Take Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, field)}
                    />
                  </label>
                  <label className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer w-full">
                    <AiOutlineUpload className="mr-2" /> Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, field)}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Manufacturing Date Field */}
        <div className="mb-4">
          <label className="text-md text-white font-medium mb-2">
            Manufacturing MM/YY
          </label>
          <DatePicker
            selected={
              manufacturingDate
                ? new Date(
                    `20${manufacturingDate.slice(-2)}`, // year (e.g. "25" -> 2025)
                    Number(manufacturingDate.slice(0, 2)) - 1 // month index (e.g. "08" -> 7)
                  )
                : null
            }
            onChange={handleManufacturingDateChange}
            dateFormat="MM/yy"
            placeholderText="MM/YY"
            className="p-2 bg-transparent text-white border border-green-200 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-lime-400"
            showMonthYearPicker
            maxDate={new Date()}
          />
        </div>

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

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
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

export default BasicDetails;
