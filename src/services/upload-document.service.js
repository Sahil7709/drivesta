import ApiService from "../core/services/api.service";
import ServerUrl from "../core/constants/serverUrl.constant";

class FileUploaderService {
  constructor() {
    this.videoRefs = {};
    this.streamStates = {};
  }

  setVideoRef(label, ref) {
    this.videoRefs[label] = ref;
  }

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

  async handleCameraClick(label, setStreamStates, setIsCameraActive, takePhoto) {
    if (!this.streamStates[label]) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );

        if (!videoDevices.length) {
          alert("No camera found on this device.");
          return;
        }

        const chosenDevice = videoDevices[1] || videoDevices[0];
        const constraints = { video: { deviceId: chosenDevice.deviceId } };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (this.videoRefs[label]) {
          this.videoRefs[label].srcObject = stream;
          this.videoRefs[label].play();
        }

        this.streamStates[label] = stream;
        setStreamStates((prev) => ({ ...prev, [label]: stream }));
        setIsCameraActive((prev) => ({ ...prev, [label]: true }));
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Camera access denied or unavailable.");
      }
    } else {
      takePhoto(label);
    }
  }

  async takePhoto(label, setPhotos, setIsCameraActive, setShowDropdown) {
    const video = this.videoRefs[label];
    if (!video) return console.warn(`No video element for label: ${label}`);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

    if (blob) {
      try {
        const file = new File([blob], `${label}.png`, { type: "image/png" });
        const uploadedData = await this.uploadFileToServer(file, label);
        const imageUrl = uploadedData?.files?.[0]?.fileUrl || null;

        if (imageUrl) {
          setPhotos((prev) => ({ ...prev, [label]: imageUrl }));
        } else {
          const base64 = canvas.toDataURL("image/png");
          setPhotos((prev) => ({ ...prev, [label]: base64 }));
        }
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to upload image. Try again.");
      }
    }

    this.stopCamera(label);
    setIsCameraActive((prev) => ({ ...prev, [label]: false }));
    setShowDropdown(null);
  }

  stopCamera(label) {
    if (this.streamStates[label]) {
      this.streamStates[label].getTracks().forEach((track) => track.stop());
      this.streamStates[label] = null;
      if (this.videoRefs[label]) this.videoRefs[label].srcObject = null;
    }
  }
}

export default new FileUploaderService();
