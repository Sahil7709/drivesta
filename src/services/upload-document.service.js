import ApiService from "../core/services/api.service";
import ServerUrl from "../core/constants/serverUrl.constant";
import imageCompression from "browser-image-compression";

class FileUploaderService {
  constructor() {
    this.videoRefs = {};
    this.streamStates = {};
  }

  setVideoRef(label, ref) {
    this.videoRefs[label] = ref;
  }

  async compressAndUpload(file, label) {
    // Compress large images
    const options = {
      maxSizeMB: 2, // compress to max 2MB
      maxWidthOrHeight: 1920, // max dimension
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    return this.uploadFileToServer(compressedFile, label);
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

  async handleFileSelection(file, label, confirmCallback) {
    if (!file || !file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    // Show preview before upload
    const previewUrl = URL.createObjectURL(file);
    confirmCallback(previewUrl, file);
  }

  async handleCameraClick(label, setStreamStates, setIsCameraActive, captureCallback) {
    if (!this.streamStates[label]) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (this.videoRefs[label]) {
          this.videoRefs[label].srcObject = stream;
          this.videoRefs[label].play();
        }

        this.streamStates[label] = stream;
        setStreamStates((prev) => ({ ...prev, [label]: stream }));
        setIsCameraActive((prev) => ({ ...prev, [label]: true }));
      } catch (err) {
        console.error("Camera access denied:", err);
        alert("Camera not available or permission denied.");
      }
    } else {
      // Capture photo if camera already active
      this.takePhoto(label, captureCallback);
    }
  }

  async takePhoto(label, captureCallback) {
    const video = this.videoRefs[label];
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${label}.png`, { type: "image/png" });
        captureCallback(URL.createObjectURL(file), file); // preview + file
      }
    }, "image/png");

    this.stopCamera(label);
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
