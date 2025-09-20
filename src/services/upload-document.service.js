// services/upload-document.service.jsx
import ApiService from "../core/services/api.service";
import ServerUrl from "../core/constants/serverUrl.constant";

class FileUploaderService {
  async uploadFileToServer(file, label) {
    if (!file) throw new Error("No file selected");

    const formData = new FormData();
    formData.append("documents", file);
    formData.append("documentType", label);

    const response = await new ApiService().apipostForm(
      ServerUrl.API_UPLOAD_IMAGE,
      formData
    );

    return response.data;
  }

  async handleFileUpload(e, label, setPhotos, setShowDropdown) {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      return alert("Please select a valid image file.");
    }

    try {
      const uploadedData = await this.uploadFileToServer(file, label);
      const imageUrl = uploadedData?.files?.[0]?.fileUrl || null;

      if (imageUrl) {
        setPhotos((prev) => ({ ...prev, [label]: imageUrl }));
      }
    } catch (err) {
      console.error("File upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setShowDropdown(null);
    }
  }
}

export default new FileUploaderService();
