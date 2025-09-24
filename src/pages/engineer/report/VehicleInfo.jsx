
export default function VehicleInfo({ data }) {
  const inspectionDate = data?.date ? new Date(data.date).toLocaleDateString() : "-";
  const inspectionTime = data?.date ? new Date(data.date).toLocaleTimeString() : "-";

  const fields = [
    { label: "Customer Name", value: data?.customerName || "-" },
    { label: "Engineer Name", value: data?.engineer_name || "-" },
    { label: "Location", value: data?.address || "-" },
    { label: "Inspection Date", value: inspectionDate },
    // { label: "Inspection Time", value: inspectionTime },
    { label: "Car Status", value: data?.carStatus || "-" },
    { label: "Brand", value: data?.brand || "-" },
    { label: "Model", value: data?.model || "-" },
    { label: "Variant", value: data?.variant || "-" },
    { label: "Fuel Type", value: data?.fuelType || "-" },
    { label: "Transmission", value: data?.transmissionType || "-" },
    { label: "Booking ID", value: data?.bookingId || "-" },
  ];

  return (
    <div className="bg-[#ffffff0a] backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] w-full max-w-4xl text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white">
        Information
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex flex-col animate-fade-in">
            <label className="text-md text-white font-medium">{label}</label>
            <div className="mt-2 p-3 bg-transparent text-white border border-green-200 shadow-inner rounded-md">
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}