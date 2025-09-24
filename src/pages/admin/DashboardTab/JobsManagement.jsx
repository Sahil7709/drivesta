import React, { useEffect, useState } from "react";
import withMaterialTable from "../../../components/constants/withMaterialTable";
import ApiService from "../../../core/services/api.service";
import ServerUrl from "../../../core/constants/serverUrl.constant";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const JobsManagement = () => {
  const [engineers, setEngineers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const response = await new ApiService().apiget(
          `${ServerUrl.API_GET_ALL_USERS_BY_ROLES}/engineer`
        );
        const engineerList = response?.data || [];
        setEngineers(
          engineerList.map((e) => ({
            label: e.name,
            value: e._id, // ID used for updating and matching
            name: e.name, // Name used for display
          }))
        );
      } catch (err) {
        console.error("Error fetching engineers:", err);
        toast.error("Failed to load engineers");
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await new ApiService().apiget(
          ServerUrl.API_GET_LOCATIONS
        );
        const locationsList = response?.data?.locations || [];
        setLocations(
          locationsList.map((loc) => ({
            label: loc,
            value: loc,
          }))
        );
      } catch (err) {
        console.error("Error fetching locations:", err);
        toast.error("Failed to load locations");
      }
    };

    setSlots([
      { label: "10:30 AM - 11:30 AM", value: "10:30 AM - 11:30 AM" },
      { label: "01:30 PM - 02:30 PM", value: "01:30 PM - 02:30 PM" },
      { label: "04:30 PM - 05:30 PM", value: "04:30 PM - 05:30 PM" },
    ]);

    fetchEngineers();
    fetchLocations();
  }, []);

  return withMaterialTable(() => null, {
    title: "Jobs Management",
    hideAddButton: true,
    disableDefaultActions: false,

    columns: [
      { accessorKey: "bookingId", header: "Booking ID" },
      { accessorKey: "customerName", header: "Customer" },
      {
        accessorKey: "engineerId", // ID for update
        header: "Engineer",
        editVariant: "select",
        editSelectOptions: engineers,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          const engineer = engineers.find((e) => e.value === val);
          return engineer ? engineer.name : "Not yet Assigned";
        },
      },
    {
      accessorKey: "date",
      header: "Date",
      Cell: ({ cell }) => {
        const value = cell.getValue();
        if (!value) return "-";
        const date = new Date(value);
        return isNaN(date) ? "-" : date.toLocaleDateString();
      },
    },
      {
        accessorKey: "timeSlot",
        header: "Slot",
        editVariant: "select",
        editSelectOptions: slots,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          const slot = slots.find((s) => s.value === val);
          return slot ? slot.label : "Not yet Assigned";
        },
      },
      {
        accessorKey: "location",
        header: "Location",
        editVariant: "select",
        editSelectOptions: locations,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          const loc = locations.find((l) => l.value === val);
          return loc ? loc.label : "—";
        },
      },
    ],

    getData: async () => {
      try {
        const response = await new ApiService().apiget(
          ServerUrl.API_GET_ALLPDIREQUEST
        );
        const data = response?.data?.data || [];
        return data.map((item) => ({
          ...item,
          id: item._id,
          engineerId: item.engineer_id, // backend field
          timeSlot: item.engineer_assignedSlot || item.timeSlot,
          location: item.engineer_location || "",
        }));
      } catch (err) {
        console.error("Error fetching jobs:", err);
        toast.error("Failed to load jobs");
        return [];
      }
    },

    updateData: async (row) => {
      try {
        const payload = {
          requestId: row.id,
          engineerId: row.engineerId,
          timeSlot: row.timeSlot,
          location: row.location || "",
        };

        const response = await new ApiService().apiput(
          ServerUrl.API_ASSIGN_ENGINEER,
          payload
        );
        toast.success("Job updated successfully");
        return response?.data || row;
      } catch (err) {
        console.error("Error updating job:", err);
        toast.error("Failed to update job");
        throw err;
      }
    },

    deleteData: async (id) => {
      try {
        const response = await new ApiService().apidelete(
          `${ServerUrl.API_GET_INSPECTION_DELETE}/${id}`
        );
        toast.success("Job deleted successfully");
        return response?.data || id;
      } catch (err) {
        console.error("Error deleting job:", err);
        toast.error("Failed to delete job");
        throw err;
      }
    },
  })();
};

export default JobsManagement;
