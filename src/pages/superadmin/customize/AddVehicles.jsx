// import React from "react";
// import { TextField, Box } from "@mui/material";
// import withMaterialTable from "../../../components/constants/withMaterialTable";
// import ApiService from "../../../core/services/api.service";
// import ServerUrl from "../../../core/constants/serverUrl.constant";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const VehicleTable = withMaterialTable(null, {
//   title: "Manage Vehicles",
//   columns: [
//     { accessorKey: "brand", header: "Brand" },
//     { accessorKey: "model", header: "Model" },
//     { accessorKey: "variant", header: "Variant" },
//     { accessorKey: "fuelType", header: "Fuel Type" },
//     { accessorKey: "transmissionType", header: "Transmission" },
//     { accessorKey: "BHPs", header: "BHPs" },
//     { accessorKey: "Airbags", header: "Airbags" },
//     { accessorKey: "Mileage", header: "Mileage" },
//     { accessorKey: "NCAP", header: "NCAP" },
//     {
//       accessorKey: "imageUrl",
//       header: "Uploaded Image",
//       Cell: ({ row }) =>
//         row?.original?.imageUrl ? (
//           <img
//             src={row.original.imageUrl}
//             alt="Vehicle"
//             style={{ width: 80, height: 50, objectFit: "cover" }}
//           />
//         ) : null,
//       enableEditing: false,
//     },
//   ],

//   getData: async () => {
//     try {
//       const response = await new ApiService().apiget(ServerUrl.API_GET_VEHICLES);
//       const vehicles = Array.isArray(response?.data?.data) ? response.data.data : [];
//       return vehicles.map((v) => ({ ...v, id: v._id }));
//     } catch (err) {
//       console.error("Vehicle fetch error:", err);
//       toast.error("Failed to fetch vehicles");
//       return [];
//     }
//   },

//   addData: async (data) => {
//     try {
//       let imageUrl = "";

//       if (data.imageFile instanceof File) {
//         const formData = new FormData();
//         formData.append("documentType", "VEHICLE_IMAGES");
//         formData.append("documents", data.imageFile);

//         const response = await new ApiService().apipost(ServerUrl.API_UPLOAD_IMAGE, formData, {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         });

//         imageUrl = response?.data?.files?.[0]?.fileUrl;
//       }

//       const payload = { ...data, imageUrl };
//       delete payload.imageFile;

//       const response = await new ApiService().apipost(ServerUrl.API_ADD_VEHICLE, payload, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       toast.success("Vehicle added successfully");
//       return { ...response.data, id: response.data._id };
//     } catch (err) {
//     // Default error message
//     let errorMessage = "Failed to add vehicle";

//     if (err?.response?.data) {
//       if (typeof err.response.data === "string") {
//         errorMessage = err.response.data;
//       } else if (err.response.data.error) {
//         errorMessage = err.response.data.error;
//       } else if (err.response.data.message) {
//         errorMessage = err.response.data.message;
//       }
//     }

//     // Specific duplicate check
//     if (
//       errorMessage.toLowerCase().includes("vehicle") &&
//       errorMessage.toLowerCase().includes("exist")
//     ) {
//       toast.error("Vehicle already exists");
//     } else {
//       toast.error(errorMessage);
//     }

//     console.error("Add vehicle error:", err);
//   }
//   },

//   updateData: async (data) => {
//     try {
//       let imageUrl = data.imageUrl;

//       if (data.imageFile instanceof File) {
//         const formData = new FormData();
//         formData.append("documentType", "VEHICLE_IMAGES");
//         formData.append("documents", data.imageFile);

//         const response = await new ApiService().apipost(ServerUrl.API_UPLOAD_IMAGE, formData, {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         });

//         imageUrl = response?.data?.files?.[0]?.fileUrl;
//       }

//       const payload = { ...data, imageUrl };
//       delete payload.imageFile;

//       await new ApiService().apipatch(`${ServerUrl.API_UPDATE_VEHICLES}/${data.id}`, payload, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       toast.success("Vehicle updated successfully");
//       return payload; // or return updated vehicle data if available from response
//     } catch (err) {
//       toast.error("Failed to update vehicle");
//       console.error("Update vehicle error:", err);
//     }
//   },

//   deleteData: async (id) => {
//     try {
//       await new ApiService().apidelete(`${ServerUrl.API_DELETE_VEHICLES}/${id}`);
//       toast.success("Vehicle deleted successfully");
//     } catch (err) {
//       toast.error("Failed to delete vehicle");
//       console.error("Delete vehicle error:", err);
//     }
//   },

//   customFormFields: (selectedRow, setSelectedRow) => {
//     if (!selectedRow) selectedRow = {};

//     return (
//       <>
//         <TextField
//           margin="dense"
//           label="Brand"
//           fullWidth
//           value={selectedRow.brand || ""}
//           onChange={(e) => setSelectedRow((prev) => ({ ...prev, brand: e.target.value }))}
//         />
//         <TextField
//           margin="dense"
//           label="Model"
//           fullWidth
//           value={selectedRow.model || ""}
//           onChange={(e) => setSelectedRow((prev) => ({ ...prev, model: e.target.value }))}
//         />
//         <TextField
//           margin="dense"
//           label="Variant"
//           fullWidth
//           value={selectedRow.variant || ""}
//           onChange={(e) => setSelectedRow((prev) => ({ ...prev, variant: e.target.value }))}
//         />
//         <TextField
//           margin="dense"
//           label="Transmission"
//           fullWidth
//           value={selectedRow.transmissionType || ""}
//           onChange={(e) =>
//             setSelectedRow((prev) => ({
//               ...prev,
//               transmissionType: e.target.value,
//             }))
//           }
//         />
//         <TextField
//           margin="dense"
//           label="Fuel Type"
//           fullWidth
//           value={selectedRow.fuelType || ""}
//           onChange={(e) => setSelectedRow((prev) => ({ ...prev, fuelType: e.target.value }))}
//         />
//         <TextField
//           margin="dense"
//           label="BHPs"
//           fullWidth
//           value={selectedRow.BHPs || ""}
//           onChange={(e) => setSelectedRow((prev) => ({ ...prev, BHPs: e.target.value }))}
//         />
//         <TextField
//           margin="dense"
//           label="Airbags"
//           fullWidth
//           value={selectedRow.Airbags || ""}
//           onChange={(e) => setSelectedRow((prev) => ({ ...prev, Airbags: e.target.value }))}
//         />
//         <TextField
//           margin="dense"
//           label="Mileage"
//           fullWidth
//           value={selectedRow.Mileage || ""}
//           onChange={(e) => setSelectedRow((prev) => ({ ...prev, Mileage: e.target.value }))}
//         />
//         <TextField
//           margin="dense"
//           label="NCAP"
//           fullWidth
//           value={selectedRow.NCAP || ""}
//           onChange={(e) => setSelectedRow((prev) => ({ ...prev, NCAP: e.target.value }))}
//         />

//         <Box mt={2}>
//           <label>Vehicle Image</label>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={(e) => {
//               const file = e.target.files[0];
//               setSelectedRow((prev) => ({ ...prev, imageFile: file }));
//             }}
//           />
//           {(selectedRow.imageFile || selectedRow.imageUrl) && (
//             <Box mt={1}>
//               <img
//                 src={
//                   selectedRow.imageFile
//                     ? URL.createObjectURL(selectedRow.imageFile)
//                     : selectedRow.imageUrl
//                 }
//                 alt="preview"
//                 style={{ width: 100, height: 60, objectFit: "cover" }}
//               />
//             </Box>
//           )}
//         </Box>
//       </>
//     );
//   },
// });

// export default function AddVehicles() {
//   return (
//     <div className="p-6">
//       <VehicleTable />
//       <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
//     </div>
//   );
// }

import React from "react";
import { TextField, Box, MenuItem, Typography, Button } from "@mui/material";
import withMaterialTable from "../../../components/constants/withMaterialTable";
import ApiService from "../../../core/services/api.service";
import ServerUrl from "../../../core/constants/serverUrl.constant";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Enum options
const FUEL_OPTIONS = ["Petrol", "Diesel", "Electric", "CNG", "Hybrid"];
const TRANSMISSION_OPTIONS = ["Manual", "Automatic"];
const NCAP_OPTIONS = [
  "5 Star",
  "4 Star",
  "3 Star",
  "2 Star",
  "1 Star",
  "Not Rated",
];

// Vehicle Table HOC
const VehicleTable = withMaterialTable(null, {
  title: "Manage Vehicles",
  columns: [
    { accessorKey: "brand", header: "Brand" },
    { accessorKey: "model", header: "Model" },
    { accessorKey: "variant", header: "Variant" },
    { accessorKey: "fuelType", header: "Fuel Type" },
    { accessorKey: "transmissionType", header: "Transmission" },
    { accessorKey: "BHPs", header: "BHPs" },
    { accessorKey: "Airbags", header: "Airbags" },
    { accessorKey: "Mileage", header: "Mileage" },
    { accessorKey: "NCAP", header: "NCAP" },
    {
      accessorKey: "imageUrl",
      header: "Uploaded Image",
      Cell: ({ row }) =>
        row?.original?.imageUrl ? (
          <img
            src={`${ServerUrl.IMAGE_URL}${row.original.imageUrl}`}
            alt="Vehicle"
            style={{ width: 80, height: 50, objectFit: "cover" }}
          />
        ) : null,
      enableEditing: false,
    },
  ],

  // Fetch vehicles
  getData: async () => {
    try {
      const response = await new ApiService().apiget(
        ServerUrl.API_GET_VEHICLES
      );
      const vehicles = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];
      return vehicles.map((v) => ({ ...v, id: v._id }));
    } catch (err) {
      console.error("Vehicle fetch error:", err);
      toast.error("Failed to fetch vehicles");
      return [];
    }
  },

  // Add vehicle
  addData: async (data) => {
    try {
      let imageUrl = "";
      if (data.imageFile instanceof File) {
        const formData = new FormData();
        formData.append("documentType", "VEHICLE_IMAGES");
        formData.append("documents", data.imageFile);

        const response = await new ApiService().apipost(
          ServerUrl.API_UPLOAD_IMAGE,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        imageUrl = response?.data?.files?.[0]?.fileUrl;
      }

      const payload = { ...data, imageUrl };
      delete payload.imageFile;

      const response = await new ApiService().apipost(
        ServerUrl.API_ADD_VEHICLE,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success("Vehicle added successfully");
      return { ...response.data, id: response.data._id };
    } catch (err) {
      let errorMessage = "Failed to add vehicle";
      if (err?.response?.data) {
        if (typeof err.response.data === "string")
          errorMessage = err.response.data;
        else if (err.response.data.error)
          errorMessage = err.response.data.error;
        else if (err.response.data.message)
          errorMessage = err.response.data.message;
      }
      if (
        errorMessage.toLowerCase().includes("vehicle") &&
        errorMessage.toLowerCase().includes("exist")
      ) {
        toast.error("Vehicle already exists");
      } else {
        toast.error(errorMessage);
      }
      console.error("Add vehicle error:", err);
    }
  },

  // Update vehicle
  updateData: async (data) => {
    try {
      let imageUrl = data.imageUrl;
      if (data.imageFile instanceof File) {
        const formData = new FormData();
        formData.append("documentType", "VEHICLE_IMAGES");
        formData.append("documents", data.imageFile);

        const response = await new ApiService().apipost(
          ServerUrl.API_UPLOAD_IMAGE,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        imageUrl = response?.data?.files?.[0]?.fileUrl;
      }

      const payload = { ...data, imageUrl };
      delete payload.imageFile;

      await new ApiService().apipatch(
        `${ServerUrl.API_UPDATE_VEHICLES}/${data.id}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success("Vehicle updated successfully");
      return payload;
    } catch (err) {
      toast.error("Failed to update vehicle");
      console.error("Update vehicle error:", err);
    }
  },

  // Delete vehicle
  deleteData: async (id) => {
    try {
      await new ApiService().apidelete(
        `${ServerUrl.API_DELETE_VEHICLES}/${id}`
      );
      toast.success("Vehicle deleted successfully");
    } catch (err) {
      toast.error("Failed to delete vehicle");
      console.error("Delete vehicle error:", err);
    }
  },

  // Custom form fields with dropdowns
  customFormFields: (selectedRow, setSelectedRow) => {
    if (!selectedRow) selectedRow = {};

    const renderDropdown = (label, valueKey, options) => (
      <TextField
        margin="dense"
        label={label}
        fullWidth
        select
        value={selectedRow[valueKey] || ""}
        onChange={(e) =>
          setSelectedRow((prev) => ({ ...prev, [valueKey]: e.target.value }))
        }
      >
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </TextField>
    );

    return (
      <>
        <TextField
          margin="dense"
          label="Brand"
          fullWidth
          value={selectedRow.brand || ""}
          onChange={(e) =>
            setSelectedRow((prev) => ({ ...prev, brand: e.target.value }))
          }
        />
        <TextField
          margin="dense"
          label="Model"
          fullWidth
          value={selectedRow.model || ""}
          onChange={(e) =>
            setSelectedRow((prev) => ({ ...prev, model: e.target.value }))
          }
        />
        <TextField
          margin="dense"
          label="Variant"
          fullWidth
          value={selectedRow.variant || ""}
          onChange={(e) =>
            setSelectedRow((prev) => ({ ...prev, variant: e.target.value }))
          }
        />

        {renderDropdown(
          "Transmission",
          "transmissionType",
          TRANSMISSION_OPTIONS
        )}
        {renderDropdown("Fuel Type", "fuelType", FUEL_OPTIONS)}

        <TextField
          margin="dense"
          label="BHPs"
          fullWidth
          value={selectedRow.BHPs || ""}
          onChange={(e) =>
            setSelectedRow((prev) => ({ ...prev, BHPs: e.target.value }))
          }
        />
        <TextField
          margin="dense"
          label="Airbags"
          fullWidth
          value={selectedRow.Airbags || ""}
          onChange={(e) =>
            setSelectedRow((prev) => ({ ...prev, Airbags: e.target.value }))
          }
        />
        <TextField
          margin="dense"
          label="Mileage"
          fullWidth
          value={selectedRow.Mileage || ""}
          onChange={(e) =>
            setSelectedRow((prev) => ({ ...prev, Mileage: e.target.value }))
          }
        />

        {renderDropdown("NCAP", "NCAP", NCAP_OPTIONS)}

        {/* Vehicle Image Upload */}
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Vehicle Image
          </Typography>

          <label htmlFor="vehicle-image-upload">
            <input
              id="vehicle-image-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file)
                  setSelectedRow((prev) => ({ ...prev, imageFile: file }));
              }}
            />
            <Button
              variant="contained"
              component="span"
              sx={{ backgroundColor: "#81da5b", color: "#FFFFFF", "&:hover": { backgroundColor: "#6fc23d" } }}
            >
              {selectedRow.imageFile || selectedRow.imageUrl
                ? "Change Image"
                : "Upload Image"}
            </Button>
          </label>

          {selectedRow.imageFile && (
            <Typography variant="body2" mt={1}>
              {selectedRow.imageFile.name}
            </Typography>
          )}

          {(selectedRow.imageFile || selectedRow.imageUrl) && (
            <Box
              mt={1}
              border={1}
              borderColor="grey.300"
              borderRadius={2}
              p={1}
              display="inline-block"
            >
            <img
              src={
                selectedRow.imageFile
                  ? URL.createObjectURL(selectedRow.imageFile) // ✅ just the file
                  : `${ServerUrl.IMAGE_URL}${selectedRow.imageUrl}` // ✅ API path
              }
              alt="preview"
              style={{
                width: 150,
                height: 90,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
            </Box>
          )}
        </Box>
      </>
    );
  },
});

// Main Component
export default function AddVehicles() {
  return (
    <div className="p-6">
      <VehicleTable />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
    </div>
  );
}
