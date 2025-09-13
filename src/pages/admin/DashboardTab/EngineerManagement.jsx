import React from "react";
import withMaterialTable from "../../../components/constants/withMaterialTable";
import ApiService from "../../../core/services/api.service";
import ServerUrl from "../../../core/constants/serverUrl.constant";

const EngineerManagement = withMaterialTable(() => null, {
  title: "Engineers Management",
  hideAddButton: true, // 🔥 this hides the Add button

  columns: [
    {
      accessorKey: "name",
      header: "Name",
      Cell: ({ row }) => (
        <span className="text-sm md:text-base">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      Cell: ({ row }) => (
        <span className="text-sm md:text-base">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "mobile",
      header: "Mobile",
      Cell: ({ row }) => (
        <span className="text-sm md:text-base">{row.original.mobile}</span>
      ),
    },
    {
      accessorKey: "city",
      header: "Location",
      Cell: ({ row }) => (
        <span className="text-sm md:text-base">{row.original.city}</span>
      ),
    },

    {
      accessorKey: "active",
      header: "Active",
      Cell: ({ row }) => {
        const active = row.original.active ?? false;

        const handleToggle = async () => {
          const newActiveStatus = !active;
          try {
            await new ApiService().apipatch(
              `${ServerUrl.API_UPDATE_USER}/${row.original.id}`,
              { active: newActiveStatus }
            );
            // refresh table
            if (EngineerManagement.options.getData) {
              await EngineerManagement.options.getData();
            }
          } catch (err) {
            console.error("Failed to update active status", err);
          }
        };

        return (
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 ${
              active ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        );
      },
    },
  ],

  getData: async () => {
    try {
      const res = await new ApiService().apiget(
        `${ServerUrl.API_GET_ALL_USERS_BY_ROLES}/engineer`
      );
      const data = res?.data || [];
      return data.map((eng) => ({
        ...eng,
        id: eng._id || eng.engineer_id,
      }));
    } catch (err) {
      console.error("Failed to fetch engineers", err);
      return [];
    }
  },

  addData: async ({ name, email, mobile, city }) => {
    await new ApiService().apipost(ServerUrl.API_REGISTER, {
      name,
      email,
      mobile,
      city,
      role: "engineer",
      active: true, // 🔥 default active
    });
    return await EngineerManagement.options.getData();
  },

  updateData: async ({ id, name, email, mobile, city }) => {
    await new ApiService().apipatch(`${ServerUrl.API_UPDATE_USER}/${id}`, {
      name,
      email,
      mobile,
      city,
    });
    return await EngineerManagement.options.getData();
  },

  deleteData: async (id) => {
    await new ApiService().apidelete(`${ServerUrl.API_DELETE_USER}/${id}`);
    return await EngineerManagement.options.getData();
  },
});

export default EngineerManagement;
