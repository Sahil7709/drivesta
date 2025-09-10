// import ApiService from "../core/services/api.service";

// export const uploadDocument = async (documentType, file) => {
//   try {
//     const formData = new FormData();
//     formData.append("documentType", documentType);
//     formData.append("documents", file); // Ensure 'documents' matches your API

//     const response = await new ApiService().apipostForm("/common/upload", formData);
//     // return response?.data?.data;
//     // const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
//     //   headers: { "Content-Type": "multipart/form-data" },
//     // });
//     console.log("uploaded imaged" , response);
//     return response.data; // Returning API response to the caller
//   } catch (error) {
//     console.error("Upload failed:", error);
//     throw error;
//   }
// };

// export const base64ToFile = (base64String, fileName) => {
//   const arr = base64String.split(",");
//   const mime = arr[0].match(/:(.*?);/)[1];
//   const bstr = atob(arr[1]);
//   let n = bstr.length;
//   const u8arr = new Uint8Array(n);

//   while (n--) u8arr[n] = bstr.charCodeAt(n);

//   return new File([u8arr], fileName, { type: mime });
// };

// file_uploader_service.jsx
// file_uploader_service.js

// import ApiService from "../core/services/api.service";
// import ServerUrl from "../core/constants/serverUrl.constant";

// class FileUploaderService {
//   constructor() {
//     this.streamStates = {};
//     this.videoRefs = {};
//     this.isCameraActive = {};
//   }

//   setVideoRef(label, ref) {
//     this.videoRefs[label] = ref;
//   }

//   async uploadFileToServer(file, label) {
//     if (!file) throw new Error("No file selected");
//     const formData = new FormData();
//     formData.append("documents", file);
//     formData.append("documentType", label);
//     console.log("LABEL : ", label);
//     const response = await new ApiService().apipostForm(
//       ServerUrl.API_UPLOAD_IMAGE,
//       formData
//     );
//     return response.data; // You can adjust depending on your API's return shape
//   }

//   async handleFileUpload(e, label, setPhotos, setShowDropdown) {
//     const file = e.target.files[0];
//     if (file && file.type.startsWith("image/")) {
//       const reader = new FileReader();
//       reader.onloadend = async () => {
//         setShowDropdown(null);
//         const fileUrl = await this.uploadFileToServer(file, label); // optional: upload right after selecting
//         setPhotos((prev) => ({ ...prev, [label]: fileUrl.files[0].fileUrl }));
//       };
//       reader.readAsDataURL(file);
//     } else {
//       console.warn("Selected file is not an image or no file selected");
//     }
//   }

//   async handleCameraClick(
//     label,
//     setStreamStates,
//     setIsCameraActive,
//     takePhoto
//   ) {
//     if (!this.isCameraActive[label]) {
//       try {
//         const devices = await navigator.mediaDevices.enumerateDevices();
//         const videoDevices = devices.filter(
//           (device) => device.kind === "videoinput"
//         );

//         if (videoDevices.length < 2) {
//           alert("This device does not have a second camera.");
//           return;
//         }

//         // Pick the 2nd camera (index 1)
//         const constraints = {
//           video: { deviceId: { exact: videoDevices[1].deviceId } },
//         };

//         const stream = await navigator.mediaDevices.getUserMedia(constraints);
//         setStreamStates((prev) => ({ ...prev, [label]: stream }));

//         if (this.videoRefs[label]) {
//           this.videoRefs[label].srcObject = stream;
//         }
//         this.streamStates[label] = stream;
//         this.isCameraActive[label] = true;
//         setIsCameraActive((prev) => ({ ...prev, [label]: true }));

//         setIsCameraActive((prev) => ({ ...prev, [label]: true }));
//       } catch (err) {
//         console.error("Error accessing camera:", err);
//         alert("Camera access denied. Please allow camera permissions.");
//       }
//     } else {
//       takePhoto(label);
//     }
//   }

//   async startCamera(label, setIsCameraActive) {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });

//       if (this.videoRefs[label]) {
//         this.videoRefs[label].srcObject = stream;
//         this.videoRefs[label].play();
//       }

//       this.streamStates[label] = stream;
//       this.isCameraActive[label] = true;
//       setIsCameraActive((prev) => ({ ...prev, [label]: true }));
//     } catch (err) {
//       console.error("Camera not available:", err);
//       alert("Camera could not be opened.");
//     }
//   }

//   async takePhoto(label, setPhotos, setIsCameraActive, setShowDropdown) {
//     const video = this.videoRefs[label];
//     if (!video) {
//       console.warn(`No video element found for label: ${label}`);
//       return;
//     }

//     const canvas = document.createElement("canvas");
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const context = canvas.getContext("2d");
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const blob = await new Promise((resolve) =>
//       canvas.toBlob(resolve, "image/png")
//     );

//     if (blob) {
//       // Wrap blob as File if needed
//       const file = new File([blob], `${label}.png`, { type: "image/png" });
//       await this.uploadFileToServer(file, label);

//       const photo = canvas.toDataURL("image/png");
//       setPhotos((prev) => ({ ...prev, [label]: photo }));
//     }

//     this.stopCamera(label);
//     this.isCameraActive[label] = false;
//     setIsCameraActive((prev) => ({ ...prev, [label]: false }));
//     setShowDropdown(null);
//   }

//   stopCamera(label) {
//     if (this.streamStates[label]) {
//       this.streamStates[label].getTracks().forEach((track) => track.stop());
//       this.streamStates[label] = null;
//       if (this.videoRefs[label]) {
//         this.videoRefs[label].srcObject = null;
//       }
//     }
//   }
// }

// export default new FileUploaderService();

// import ApiService from "../core/services/api.service";
// import ServerUrl from "../core/constants/serverUrl.constant";

// class FileUploaderService {
//   constructor() {
//     this.videoRefs = {};
//     this.streamStates = {};
//   }

//   setVideoRef(label, ref) {
//     this.videoRefs[label] = ref;
//   }

//   // Upload file to server
//   async uploadFileToServer(file, label) {
//     if (!file) throw new Error("No file selected");

//     const formData = new FormData();
//     formData.append("documents", file);
//     formData.append("documentType", label);

//     const response = await new ApiService().apipostForm(
//       ServerUrl.API_UPLOAD_IMAGE,
//       formData
//     );

//     return response.data; // Adjust if your API returns differently
//   }

//   // Handle file selection (gallery / file picker)
//   async handleFileUpload(e, label, setPhotos, setShowDropdown) {
//     const file = e.target.files[0];
//     if (!file || !file.type.startsWith("image/")) {
//       console.warn("Selected file is not an image or no file selected");
//       return;
//     }

//     try {
//       const uploadedData = await this.uploadFileToServer(file, label);
//       const imageUrl = uploadedData?.files?.[0]?.fileUrl || null;

//       if (imageUrl) {
//         setPhotos((prev) => ({ ...prev, [label]: imageUrl }));
//       }
//     } catch (err) {
//       console.error("File upload failed:", err);
//       alert("Upload failed. Please try again.");
//     } finally {
//       setShowDropdown(null);
//     }
//   }

//   // Open camera
//   async handleCameraClick(label, setStreamStates, setIsCameraActive, takePhoto) {
//     if (!this.streamStates[label]) {
//       try {
//         const devices = await navigator.mediaDevices.enumerateDevices();
//         const videoDevices = devices.filter(
//           (device) => device.kind === "videoinput"
//         );

//         if (!videoDevices.length) {
//           alert("No camera found on this device.");
//           return;
//         }

//         // Prefer second camera if exists, else fallback to first
//         const chosenDevice = videoDevices[1] || videoDevices[0];
//         const constraints = { video: { deviceId: chosenDevice.deviceId } };

//         // Stop previous camera if running
//         if (this.streamStates[label]) {
//           this.stopCamera(label);
//         }

//         const stream = await navigator.mediaDevices.getUserMedia(constraints);

//         if (this.videoRefs[label]) {
//           this.videoRefs[label].srcObject = stream;
//           this.videoRefs[label].play();
//         }

//         this.streamStates[label] = stream;
//         setStreamStates((prev) => ({ ...prev, [label]: stream }));
//         setIsCameraActive((prev) => ({ ...prev, [label]: true }));
//       } catch (err) {
//         console.error("Error accessing camera:", err);
//         alert("Camera access denied or unavailable.");
//       }
//     } else {
//       // If camera already active → take photo
//       takePhoto(label);
//     }
//   }

//   // Take photo from video stream
//   async takePhoto(label, setPhotos, setIsCameraActive, setShowDropdown) {
//     const video = this.videoRefs[label];
//     if (!video) {
//       console.warn(`No video element found for label: ${label}`);
//       return;
//     }

//     const canvas = document.createElement("canvas");
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const context = canvas.getContext("2d");
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const blob = await new Promise((resolve) =>
//       canvas.toBlob(resolve, "image/png")
//     );

//     if (blob) {
//       try {
//         const file = new File([blob], `${label}.png`, { type: "image/png" });
//         const uploadedData = await this.uploadFileToServer(file, label);

//         const imageUrl = uploadedData?.files?.[0]?.fileUrl || null;

//         // Use server URL if available, else fallback to base64 preview
//         if (imageUrl) {
//           setPhotos((prev) => ({ ...prev, [label]: imageUrl }));
//         } else {
//           const base64 = canvas.toDataURL("image/png");
//           setPhotos((prev) => ({ ...prev, [label]: base64 }));
//         }
//       } catch (err) {
//         console.error("Upload failed:", err);
//         alert("Failed to upload image. Try again.");
//       }
//     }

//     this.stopCamera(label);
//     setIsCameraActive((prev) => ({ ...prev, [label]: false }));
//     setShowDropdown(null);
//   }

//   // Stop camera stream
//   stopCamera(label) {
//     if (this.streamStates[label]) {
//       this.streamStates[label].getTracks().forEach((track) => track.stop());
//       this.streamStates[label] = null;
//       if (this.videoRefs[label]) {
//         this.videoRefs[label].srcObject = null;
//       }
//     }
//   }
// }

// export default new FileUploaderService();

// file_uploader_service.js
import ApiService from "../core/services/api.service";
import ServerUrl from "../core/constants/serverUrl.constant";

class FileUploaderService {
  constructor() {
    this.streamStates = {};
    this.videoRefs = {};
    this.isCameraActive = {};
  }

  setVideoRef(label, ref) {
    this.videoRefs[label] = ref;
  }

  async uploadFileToServer(file, label) {
    if (!file) throw new Error("No file selected");
    const formData = new FormData();
    formData.append("documents", file);   // make sure backend expects "documents"
    formData.append("documentType", label);

    try {
      const response = await new ApiService().apipostForm(
        ServerUrl.API_UPLOAD_IMAGE,
        formData
      );
      console.log("Uploaded image:", response.data);
      return response.data; // adjust if API returns { fileUrl: "..." }
    } catch (err) {
      console.error("Upload failed:", err);
      throw err;
    }
  }

  // for file selection
  async handleFileUpload(e, label, setPhotos, setShowDropdown) {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      console.warn("Selected file is not an image or no file selected");
      return;
    }

    try {
      const uploaded = await this.uploadFileToServer(file, label);
      setPhotos((prev) => ({
        ...prev,
        [label]: uploaded?.fileUrl || URL.createObjectURL(file),
      }));
      setShowDropdown(null);
    } catch (err) {
      alert("Failed to upload image. Please try again.");
    }
  }

  // for opening camera
  async handleCameraClick(label, setStreamStates, setIsCameraActive) {
    if (this.isCameraActive[label]) {
      console.log("Camera already active for:", label);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.streamStates[label] = stream;
      this.isCameraActive[label] = true;

      if (this.videoRefs[label]) {
        this.videoRefs[label].srcObject = stream;
        await this.videoRefs[label].play();
      }

      setStreamStates((prev) => ({ ...prev, [label]: stream }));
      setIsCameraActive((prev) => ({ ...prev, [label]: true }));
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Camera access denied. Please allow permissions.");
    }
  }

  // capture photo from video
  async takePhoto(label, setPhotos, setIsCameraActive, setShowDropdown) {
    const video = this.videoRefs[label];
    if (!video) {
      console.warn(`No video element found for label: ${label}`);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    if (!blob) {
      alert("Failed to capture photo.");
      return;
    }

    try {
      const file = new File([blob], `${label}.png`, { type: "image/png" });
      const uploaded = await this.uploadFileToServer(file, label);

      setPhotos((prev) => ({
        ...prev,
        [label]: uploaded?.fileUrl || canvas.toDataURL("image/png"),
      }));
    } catch (err) {
      alert("Failed to upload image.");
    }

    this.stopCamera(label);
    this.isCameraActive[label] = false;
    setIsCameraActive((prev) => ({ ...prev, [label]: false }));
    setShowDropdown(null);
  }

  stopCamera(label) {
    if (this.streamStates[label]) {
      this.streamStates[label].getTracks().forEach((track) => track.stop());
      this.streamStates[label] = null;
      if (this.videoRefs[label]) {
        this.videoRefs[label].srcObject = null;
      }
    }
  }
}

export default new FileUploaderService();

