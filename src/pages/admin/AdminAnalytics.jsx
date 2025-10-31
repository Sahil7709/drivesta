import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";
import "chart.js/auto";
import { FiCalendar, FiFilter, FiDownload, FiRefreshCw } from "react-icons/fi";
import * as XLSX from "xlsx";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const COLORS = {
  // Use a large palette for multiple engineers (loop if engineers > palette length)
  engineer: [
    "#4f46e5cc", // indigo
    "#10b981cc", // emerald
    "#f59e0bcc", // amber
    "#ef4444cc", // red
    "#8b5cf6cc", // violet
    "#ec4899cc", // pink
    "#14b8a6cc", // teal
    "#f97316cc", // orange
    "#3b82f6cc", // blue
    "#22c55ecc", // green
  ],

  location: [
    "#6366f1cc", // indigo
    "#a855f7cc", // purple
    "#06b6d4cc", // cyan
    "#f43f5ecc", // rose
    "#84cc16cc", // lime
    "#eab308cc", // yellow
    "#0ea5e9cc", // sky
    "#fb923ccc", // orange
  ],

  brand: [
    "#1d4ed8cc", // blue
    "#9333eacc", // purple
    "#16a34acc", // green
    "#dc2626cc", // red
    "#ea580ccc", // orange
    "#0891b2cc", // cyan
    "#facc15cc", // yellow
    "#be123ccc", // rose
  ],

  status: [
    "#3b82f6cc", // blue
    "#f59e0bcc", // amber
    "#a855f7cc", // purple
    "#22c55ecc", // green
    "#ef4444cc", // red
    "#14b8a6cc", // teal
    "#2563ebcc", // blue darker
    "#64748bcc", // slate
    "#f59e0bcc", // amber
    "#10b981cc", // green
    "#f97316cc", // orange
    "#3b82f6cc", // blue
    "#16a34acc", // green
    "#8b5cf6cc", // violet
  ],
};

const getChartConfig = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "right", labels: { usePointStyle: true } },
    tooltip: {
      callbacks: {
        label: (context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          return `${context.label}: ${context.raw} (${Math.round(
            (context.raw / total) * 100
          )}%)`;
        },
      },
    },
  },
});

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-md mb-8">
    <h3 className="text-lg font-body text-gray-900 mb-6">{title}</h3>
    <div className="h-80">{children}</div>
  </div>
);

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const AdminAnalytics = () => {
  const [timePeriod, setTimePeriod] = useState("monthly");
  const [customRange, setCustomRange] = useState(false);
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [filteredData, setFilteredData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const chartConfig = useMemo(() => getChartConfig(), []);

  const handleTimePeriodChange = useCallback((period) => {
    setTimePeriod(period);
    setCustomRange(period === "custom");
    const now = new Date();
    const periods = {
      monthly: [startOfMonth(now), endOfMonth(now)],
      quarterly: [startOfQuarter(now), endOfQuarter(now)],
      yearly: [startOfYear(now), endOfYear(now)],
    };
    if (periods[period]) {
      setStartDate(periods[period][0]);
      setEndDate(periods[period][1]);
    }
  }, []);

  const createChartData = useCallback(
    (data, colors, label) => ({
      labels: Object.keys(data),
      datasets: [
        {
          label,
          data: Object.values(data),
          backgroundColor: colors,
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    }),
    []
  );

  const exportToExcel = useCallback(() => {
    if (!filteredData.inspections?.length) {
      toast.error("No inspection data available to export.");
      return;
    }
    try {
      const exportData = filteredData.inspections.map((inspection) => ({
        PDIRequestID: inspection.PDIRequestID || "N/A",
        "Customer Name": inspection.customerName || "N/A",
        Date: inspection.date
          ? format(new Date(inspection.date), "MMM dd, yyyy")
          : "N/A",
        Location: inspection.address || "N/A",
        Brand: inspection.vehicle?.brand || inspection.brand || "N/A",
        Engineer: inspection.engineer_name || "N/A",
        Status: inspection.status || "N/A",
        "Payment Status": inspection.paymentStatus || "N/A",
        Amount: inspection.price || inspection.amount || 0,
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inspections");
      XLSX.writeFile(wb, "InspectionData.xlsx");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export data. Please try again.");
    }
  }, [filteredData.inspections]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [countRes, allPdiRes, locationsRes, engineersRes, revenueRes] =
          await Promise.all([
            new ApiService().apipost(ServerUrl.API_GET_REQUEST_COUNT),
            new ApiService().apiget(ServerUrl.API_GET_ALLPDIREQUEST),
            new ApiService().apiget(ServerUrl.API_GET_LOCATIONS),
            new ApiService()
              .apipost(ServerUrl.API_MODULE_USER + "/getUsersByRoles", {
                roles: ["engineer"],
              })
              .catch(() => ({ data: { data: [] } })),
            new ApiService()
              .apiget(ServerUrl.API_GET_REVENUE_TREND)
              .catch(() => ({ data: { data: [] } })),
          ]);

        // CHANGE: Enhanced logging for pending requests calculation
        console.log("API Responses:", {
          countRes: countRes?.data?.data,
          allPdiRes: allPdiRes?.data?.data?.slice(0, 2),
          locationsRes: locationsRes?.data?.data,
          engineersRes: engineersRes?.data?.data,
          revenueRes: revenueRes?.data?.data,
        });

        if (countRes?.data?.data && Array.isArray(allPdiRes?.data?.data)) {
          const c = countRes.data.data;
          const inspections = allPdiRes.data.data;
          const locations = locationsRes?.data?.data || [];
          const engineers = engineersRes?.data?.data || [];

          const locationMap = locations.reduce((acc, loc) => {
            const locId = loc._id || loc.id;
            const locName = loc.name || loc.location || "Unknown";
            if (locId && locName) acc[locId] = locName;
            return acc;
          }, {});

          const engineerMap = engineers.reduce((acc, eng) => {
            const engId = eng._id || eng.id;
            const engName =
              eng.name || eng.engineer || eng.fullName || "Unknown";
            if (engId && engName) acc[engId] = engName;
            return acc;
          }, {});

          const enrichedInspections = inspections.map((inspection) => {
            console.log("Inspection:", {
              PDIRequestID: inspection.PDIRequestID,
              bookingId: inspection.bookingId,
              location: inspection.location,
              address: inspection.address,
              engineer: inspection.engineer,
              engineer_name: inspection.engineer_name,
            });
            return {
              ...inspection,
              PDIRequestID:
                inspection.PDIRequestID ||
                inspection.bookingId ||
                inspection.id ||
                inspection._id ||
                "N/A",
              address:
                inspection.address ||
                (inspection.location
                  ? typeof inspection.location === "string"
                    ? locationMap[inspection.location] || inspection.location
                    : inspection.location.name ||
                      inspection.location.location ||
                      "N/A"
                  : "N/A"),
              engineer_name:
                inspection.engineer_name ||
                (inspection.engineer
                  ? typeof inspection.engineer === "string"
                    ? engineerMap[inspection.engineer] || inspection.engineer
                    : inspection.engineer.name ||
                      inspection.engineer.engineer ||
                      "N/A"
                  : "N/A"),
              price: inspection.price || inspection.amount || 0, // Revenue field
            };
          });

          // CHANGE: Calculate pending requests as total - completed
          const pendingCount =
            c.allRequests && c.completedJobs
              ? c.allRequests - c.completedJobs
              : enrichedInspections.filter(
                  (item) => item.status.toUpperCase() === "PENDING"
                ).length;
          console.log("Pending Calculation:", {
            allRequests: c.allRequests,
            completedJobs: c.completedJobs,
            pendingCount: pendingCount,
          });

          const statusTrend = enrichedInspections.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
          }, {});

          const dailyTrend = enrichedInspections.reduce((acc, item) => {
            const dateStr = format(new Date(item.date), "MMM dd");
            acc[dateStr] = (acc[dateStr] || 0) + 1;
            return acc;
          }, {});
          const dailyTrendArray = Object.entries(dailyTrend).map(
            ([name, value]) => ({ name, value })
          );

          const byEngineer = enrichedInspections.reduce((acc, item) => {
            const engineerName = item.engineer_name || "Unknown";
            acc[engineerName] = (acc[engineerName] || 0) + 1;
            return acc;
          }, {});

          const byLocation = enrichedInspections.reduce((acc, item) => {
            const locationName = item.address || "Unknown";
            acc[locationName] = (acc[locationName] || 0) + 1;
            return acc;
          }, {});

          const byBrand = enrichedInspections.reduce((acc, item) => {
            acc[item.brand] = (acc[item.brand] || 0) + 1;
            return acc;
          }, {});

          // Revenue Trend only for Completed requests
          const completedInspections = enrichedInspections.filter(
            (item) => item.status?.toUpperCase() === "COMPLETED"
          );

          const revenueTrendMap = completedInspections.reduce((acc, item) => {
            const month = format(new Date(item.date), "MMM") || "Unknown";
            acc[month] = (acc[month] || 0) + (item.price || 0); // <-- use item.price
            return acc;
          }, {});

          // Revenue Trend: Only include paid and completed
          const revenueTrendArray = Object.entries(
            enrichedInspections
              .filter(
                (item) =>
                  item.status?.toUpperCase() === "COMPLETED" &&
                  item.paymentStatus?.toUpperCase() === "PAID"
              )
              .reduce((acc, item) => {
                const month = format(new Date(item.date), "MMM");
                acc[month] =
                  (acc[month] || 0) + (item.price || item.amount || 0);
                return acc;
              }, {})
          ).map(([month, revenue]) => ({ month, revenue }));

          setFilteredData({
            summary: {
              total: c.allRequests || 0,
              completed: c.completedJobs || 0,
              pending: pendingCount,
            },
            dailyTrend: dailyTrendArray,
            statusTrend,
            byEngineer,
            byLocation,
            byBrand,
            inspections: enrichedInspections,
            locationList: locations,
            revenueTrend: revenueTrendArray,
          });
        } else {
          throw new Error("Failed to fetch required data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load analytics data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timePeriod, startDate, endDate]);

  return (
    <div className="min-h-screen bg-primary p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Vehicle Inspection Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              {format(startDate, "MMM dd, yyyy")} -{" "}
              {format(endDate, "MMM dd, yyyy")}
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-filter"
            >
              <FiFilter className="icon" /> Filters
            </button>
            <button onClick={exportToExcel} className="btn-download">
              <FiDownload className="icon" /> Export
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="label">Time Period</label>
                <select
                  className="input-select"
                  value={timePeriod}
                  onChange={(e) => handleTimePeriodChange(e.target.value)}
                >
                  {["monthly", "quarterly", "yearly", "custom"].map(
                    (period) => (
                      <option key={period} value={period}>
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </option>
                    )
                  )}
                </select>
              </div>

              {customRange && (
                <>
                  <div>
                    <label className="label">Start Date</label>
                    <input
                      type="date"
                      value={format(startDate, "yyyy-MM-dd")}
                      onChange={(e) => setStartDate(new Date(e.target.value))}
                      className="input-select"
                    />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input
                      type="date"
                      value={format(endDate, "yyyy-MM-dd")}
                      onChange={(e) => setEndDate(new Date(e.target.value))}
                      className="input-select"
                    />
                  </div>
                </>
              )}

              <div className="flex items-end">
                <button
                  onClick={() => handleTimePeriodChange("monthly")}
                  className="btn-reset"
                >
                  <FiRefreshCw className="icon" /> Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-8 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {["total", "completed", "pending"].map((type) => {
                const bgColor =
                  type === "total"
                    ? "bg-indigo-100"
                    : type === "completed"
                    ? "bg-green-100"
                    : "bg-yellow-100";
                const textColor =
                  type === "total"
                    ? "text-indigo-600"
                    : type === "completed"
                    ? "text-green-600"
                    : "text-yellow-600";
                const borderColor =
                  type === "total"
                    ? "border-indigo-500"
                    : type === "completed"
                    ? "border-green-500"
                    : "border-yellow-500";

                return (
                  <div
                    key={type}
                    className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${borderColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {type === "total"
                            ? "Total Requests"
                            : type === "completed"
                            ? "Completed Requests"
                            : "Pending Requests"}
                        </p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">
                          {filteredData.summary?.[type] || 0}
                        </h3>
                        {type !== "total" && (
                          <p className="text-sm text-gray-500 mt-1">
                            {Math.round(
                              (filteredData.summary?.[type] /
                                filteredData.summary?.total) *
                                100 || 0
                            )}
                            % of total
                          </p>
                        )}
                      </div>
                      <div className={`p-3 rounded-lg ${bgColor}`}>
                        <FiCalendar className={`h-6 w-6 ${textColor}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trend & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <ChartCard title="Daily Inspection Trend">
                {filteredData.dailyTrend?.length ? (
                  <Line
                    data={{
                      labels: filteredData.dailyTrend.map((item) => item.name),
                      datasets: [
                        {
                          label: "Inspections",
                          data: filteredData.dailyTrend.map(
                            (item) => item.value
                          ),
                          backgroundColor: "#4f46e540",
                          borderColor: "#4f46e5",
                          borderWidth: 2,
                          tension: 0.4,
                          fill: true,
                        },
                      ],
                    }}
                    options={chartConfig}
                  />
                ) : (
                  <div className="flex items-center justify-center h-80 text-gray-500">
                    No data available
                  </div>
                )}
              </ChartCard>

              <ChartCard title="Status Distribution">
                {filteredData.statusTrend &&
                Object.keys(filteredData.statusTrend).length ? (
                  <Pie
                    data={createChartData(
                      filteredData.statusTrend,
                      COLORS.status,
                      "Status"
                    )}
                    options={chartConfig}
                  />
                ) : (
                  <div className="flex items-center justify-center h-80 text-gray-500">
                    No data available
                  </div>
                )}
              </ChartCard>
            </div>

            {/* By Engineer, Location, Brand */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <ChartCard title="By Engineer">
                {filteredData.byEngineer &&
                Object.keys(filteredData.byEngineer).length ? (
                  <Pie
                    data={createChartData(
                      filteredData.byEngineer,
                      COLORS.engineer,
                      "Engineer"
                    )}
                    options={chartConfig}
                  />
                ) : (
                  <div className="flex items-center justify-center h-80 text-gray-500">
                    No data available
                  </div>
                )}
              </ChartCard>

              <ChartCard title="By Location">
                {filteredData.byLocation &&
                Object.keys(filteredData.byLocation).length ? (
                  <Pie
                    data={createChartData(
                      filteredData.byLocation,
                      COLORS.location,
                      "Location"
                    )}
                    options={chartConfig}
                  />
                ) : (
                  <div className="flex items-center justify-center h-80 text-gray-500">
                    No data available
                  </div>
                )}
              </ChartCard>

              <ChartCard title="By Brand">
                {filteredData.byBrand &&
                Object.keys(filteredData.byBrand).length ? (
                  <Pie
                    data={createChartData(
                      filteredData.byBrand,
                      COLORS.brand,
                      "Brand"
                    )}
                    options={chartConfig}
                  />
                ) : (
                  <div className="flex items-center justify-center h-80 text-gray-500">
                    No data available
                  </div>
                )}
              </ChartCard>
            </div>

            {/* Revenue Trend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <ChartCard title="Revenue Trend">
                {filteredData.revenueTrend?.length ? (
                  <Bar
                    data={{
                      labels: filteredData.revenueTrend.map(
                        (item) => item.month
                      ),
                      datasets: [
                        {
                          label: "Revenue (₹)",
                          data: filteredData.revenueTrend.map(
                            (item) => item.revenue
                          ),
                          backgroundColor: "#10b981cc",
                        },
                      ],
                    }}
                    options={chartConfig}
                  />
                ) : (
                  <div className="flex items-center justify-center h-80 text-gray-500">
                    No revenue data available
                  </div>
                )}
              </ChartCard>
            </div>

            {/* Recent Inspections */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-body text-gray-900">
                  Recent Inspections
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "PDIRequestID",
                        "Customer Name",
                        "Date",
                        "Location",
                        "Brand",
                        "Engineer",
                        "Status",
                        "Payment Status",
                        "Amount",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.inspections
                      ?.slice(0, 10)
                      .map((inspection) => (
                        <tr
                          key={
                            inspection.PDIRequestID ||
                            inspection._id ||
                            Math.random()
                          }
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {inspection.PDIRequestID || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {inspection.customerName || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {inspection.date
                              ? format(
                                  new Date(inspection.date),
                                  "MMM dd, yyyy"
                                )
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {inspection.address || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {inspection.vehicle?.brand ||
                              inspection.brand ||
                              "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {inspection.engineer_name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                inspection.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : inspection.status === "IN_PROGRESS"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {inspection.status || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${inspection.paymentStatus === "PAID"
                                ? "bg-green-100 text-green-800"
                                : inspection.paymentStatus === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {inspection.paymentStatus || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            ₹{inspection.price || inspection.amount || "0"}
                          </td>
                        </tr>
                      ))}
                    {!filteredData.inspections?.length && (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No inspections found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

AdminAnalytics.propTypes = {};

export default AdminAnalytics;
