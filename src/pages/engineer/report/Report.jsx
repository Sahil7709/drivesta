import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import VehicleInfo from "./VehicleInfo";
import BasicDetails from "./BasicDetails";
import ProfilePhotos from "./ProfilePhotos";
import BodyPanels from "./BodyPanels";
import Glasses from "./Glasses";
import RubberComponents from "./RubberComponent";
import SeatFabrics from "./SeatsFabrics";
import SeatBelts from "./SeatBelts";
import PlasticPanels from "./PlasticPanel";
import FeaturesFunctions from "./FeaturesFunctions";
import LiveParameters from "./LiveParameters";
import FluidLevels from "./FluidLevels";
import EngineDetails from "./Engine";
import TransmissionDetails from "./Transmission";
import BrakesDetails from "./Brakes";
import DiagnosticCodes from "./DiagnosticsCodes";
import OtherObservations from "./OtherObservations";
import Tyres from "./Tyres";
import ApiService from "../../../core/services/api.service";
import ServerUrl from "../../../core/constants/serverUrl.constant";
import { APPLICATION_CONSTANTS } from "../../../core/constants/app.constant";
import car from "../../../assets/car2.jpg";
import { useAuth } from "../../../core/contexts/AuthContext";
import { toast } from "react-toastify";

export default function Report() {
  const { id } = useParams();
  const { user } = useAuth();
  const stepRefs = useRef([]);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(car);
  const [showPhoto, setShowPhoto] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const steps = [
    "Information",
    "Basic Details",
    "Profile Photos",
    "Body Panels",
    "Glasses",
    "Rubber Components",
    "Seat & Fabrics",
    "Seat Belts",
    "Plastic Panels",
    "Features & Functions",
    "Live Parameters",
    "Fluid Levels",
    "Engine",
    "Transmission",
    "Brakes",
    "Diagnostic Codes",
    "Tyres",
    "Other Observations",
  ];

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const response = await new ApiService().apiget(
          `${ServerUrl.API_GET_REQUEST_BY_ID}/${id}`
        );
        if (response?.data?.data) {
          setFormData(response.data.data);
        } else {
          setError("No inspection data found");
        }
      } catch (err) {
        console.error("Failed to fetch inspection data", err);
        setError("Failed to fetch inspection data");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // onChange handler expects (field, value)
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const query = new URLSearchParams(useLocation().search);
  const isAdm = query.get("isAdm") === "true";

  const handleSave = async (status = null, finalSubmit = false) => {
    setSaving(true);
    try {
      const payload = { id: formData._id, ...formData };
      if (status || isAdm) {
        payload["status"] = status ? status : formData.status; // set status if provided
      }
      await new ApiService().apiput(
        `${ServerUrl.API_GET_INSPECTION_UPDATE}/${id}`,
        payload
      );
      toast.success("Saved successfully");
      finalSubmit && !isAdm && navigate("/engineer/dashboard/completed-job");
      return true;
    } catch (err) {
      console.error("Save failed", err);
      toast.error("Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNextWithSaveConfirm = async () => {
    setConfirmConfig({
      message: "Are you sure you want to save before going next?",
      onConfirm: async () => {
        const saved = await handleSave();
        if (saved && step < steps.length - 1) {
          setStep((prev) => prev + 1);
        }
      },
    });
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const renderStep = () => {
    const activeTab = steps[step];
    switch (activeTab) {
      case "Information":
        return <VehicleInfo data={formData} onChange={handleChange} />;
      case "Basic Details":
        return (
          <BasicDetails
            data={formData}
            onChange={handleChange}
            showPhoto={showPhoto}
            setShowPhoto={setShowPhoto}
          />
        );
      case "Profile Photos":
        return <ProfilePhotos data={formData} onChange={handleChange} />;
      case "Body Panels":
        return <BodyPanels data={formData} onChange={handleChange} />;
      case "Glasses":
        return <Glasses data={formData} onChange={handleChange} />;
      case "Rubber Components":
        return <RubberComponents data={formData} onChange={handleChange} />;
      case "Seat & Fabrics":
        return <SeatFabrics data={formData} onChange={handleChange} />;
      case "Seat Belts":
        return <SeatBelts data={formData} onChange={handleChange} />;
      case "Plastic Panels":
        return <PlasticPanels data={formData} onChange={handleChange} />;
      case "Features & Functions":
        return <FeaturesFunctions data={formData} onChange={handleChange} />;
      case "Live Parameters":
        return <LiveParameters data={formData} onChange={handleChange} />;
      case "Fluid Levels":
        return <FluidLevels data={formData} onChange={handleChange} />;
      case "Engine":
        return <EngineDetails data={formData} onChange={handleChange} />;
      case "Transmission":
        return <TransmissionDetails data={formData} onChange={handleChange} />;
      case "Brakes":
        return <BrakesDetails data={formData} onChange={handleChange} />;
      case "Diagnostic Codes":
        return <DiagnosticCodes data={formData} onChange={handleChange} />;
      case "Tyres":
        return <Tyres data={formData} onChange={handleChange} />;
      case "Other Observations":
        return <OtherObservations data={formData} onChange={handleChange} />;
      default:
        return null;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-primary">
      {/* Background */}
      <div
        className="fixed inset-0 z-0 bg-no-repeat bg-cover bg-center"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          backgroundAttachment: "fixed",
        }}
      ></div>

      {/* Foreground */}
      <div className="relative z-10 w-full flex flex-col items-center px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        {isAdm &&
          (formData.status == APPLICATION_CONSTANTS.REQUEST_STATUS.NEW.value ||
            formData.status ==
              APPLICATION_CONSTANTS.REQUEST_STATUS.WAITING_FOR_APPROVAL.value ||
            formData.status ==
              APPLICATION_CONSTANTS.REQUEST_STATUS.ASSIGNED_ENGINEER.value ||
            formData.status ==
              APPLICATION_CONSTANTS.REQUEST_STATUS.IN_PROGRESS.value) && (
            <div className="flex justify-end gap-2 w-full max-w-4xl mb-4 ml-auto">
              {/* `<button
          onClick={() => {
            if (window.confirm("Are you sure you want to approve this inspection?")) {
              handleSave(APPLICATION_CONSTANTS.REQUEST_STATUS.ADMIN_APPROVED.value)
                .then(() => {
                  const adminRoles = ["admin", "superadmin"];
                  if (adminRoles.includes(user.role)) {
                    navigate(`/${user.role}/dashboard/inspection-report`);
                  }
                });
            }
          }}
          className="bg-button hover:bg-green-700 text-white px-4 py-2 rounded-2xl"
        >
          
        </button> */}

              <button
                onClick={() =>
                  setConfirmConfig({
                    message:
                      "Are you sure you want to approve this inspection?",
                    onConfirm: async () => {
                      await handleSave(
                        APPLICATION_CONSTANTS.REQUEST_STATUS.ADMIN_APPROVED
                          .value
                      );
                      const adminRoles = ["admin", "superadmin"];
                      if (adminRoles.includes(user.role)) {
                        navigate(`/${user.role}/dashboard/inspection-report`);
                      }
                    },
                  })
                }
                className="bg-button hover:bg-green-700 text-white px-4 py-2 rounded-2xl"
              >
                Approve
              </button>

              <button
                onClick={() =>
                  setConfirmConfig({
                    message: "Are you sure you want to reject this inspection?",
                    onConfirm: async () => {
                      await handleSave(
                        APPLICATION_CONSTANTS.REQUEST_STATUS
                          .WAITING_FOR_APPROVAL.value
                      );
                      const adminRoles = ["admin", "superadmin"];
                      if (adminRoles.includes(user.role)) {
                        navigate(`/${user.role}/dashboard/inspection-report`);
                      }
                    },
                  })
                }
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-2xl"
              >
                Reject
              </button>
            </div>
          )}

        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Pre-Delivery Inspection Form
          </h2>
        </div>

        {/* Stepper */}
        <div className="flex overflow-x-auto whitespace-nowrap overflow-y-scroll [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-1 p-1 rounded-full scrollbar-hide mb-8 w-full max-w-3xl bg-white/30 shadow-md backdrop-blur-md">
          {steps.map((label, index) => (
            <button
              key={label}
              ref={(el) => (stepRefs.current[index] = el)}
              onClick={() => setStep(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                step === index
                  ? "bg-gradient-to-r from-lime-300 to-button text-white shadow-md cursor-pointer"
                  : "bg-white/30 text-gray-700 hover:bg-white/40 cursor-pointer"
              }`}
              style={{ minWidth: "8rem" }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="w-full flex justify-center px-2">{renderStep()}</div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between mt-8 sm:mt-12 w-full max-w-4xl gap-4 sm:gap-0 px-2">
          {step > 0 ? (
            <button
              onClick={goBack}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 transition-all font-medium text-gray-800 shadow-md"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < steps.length - 1 ? (
            formData.status == APPLICATION_CONSTANTS.REQUEST_STATUS.NEW.value ||
            formData.status ==
              APPLICATION_CONSTANTS.REQUEST_STATUS.WAITING_FOR_APPROVAL.value ||
            formData.status ==
              APPLICATION_CONSTANTS.REQUEST_STATUS.ASSIGNED_ENGINEER.value ||
            formData.status ==
              APPLICATION_CONSTANTS.REQUEST_STATUS.IN_PROGRESS.value ? (
              <button
                onClick={handleNextWithSaveConfirm}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-white font-body shadow-lg transform hover:scale-105 transition-all"
              >
                {saving ? "Saving..." : "Next"}
              </button>
            ) : (
              ""
            )
          ) : formData.status ==
              APPLICATION_CONSTANTS.REQUEST_STATUS.NEW.value ||
            formData.status ==
              APPLICATION_CONSTANTS.REQUEST_STATUS.WAITING_FOR_APPROVAL.value ||
            formData.status ==
              APPLICATION_CONSTANTS.REQUEST_STATUS.ASSIGNED_ENGINEER.value ||
            formData.status ==
              APPLICATION_CONSTANTS.REQUEST_STATUS.IN_PROGRESS.value ? (
            <button
              onClick={() =>
                handleSave(
                  isAdm
                    ? null
                    : APPLICATION_CONSTANTS.REQUEST_STATUS.WAITING_FOR_APPROVAL
                        .value,
                  true
                )
              }
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-body shadow-lg transform hover:scale-105 transition-all"
            >
              {saving ? "Submitting..." : "Submit"}
            </button>
          ) : (
            ""
          )}
        </div>
      </div>
      {confirmConfig && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
    <div className="bg-primary rounded-2xl shadow-xl p-6 w-96 transform transition-all duration-300 scale-95 hover:scale-100">
      <h2 className="text-xl font-bold text-gray-900 mb-3">Confirmation</h2>
      <p className="text-gray-600 mb-6">{confirmConfig.message}</p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setConfirmConfig(null)}
          className="px-4 py-2 rounded-lg border border-button text-gray-700 hover:bg-green-400 transition"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            await confirmConfig.onConfirm();
            setConfirmConfig(null);
          }}
          className="px-4 py-2 rounded-lg bg-button text-white font-medium shadow-md hover:bg-green-400 transition"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}


      {/* Photo Viewer */}
      {showPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowPhoto(null)}
        >
          <img
            src={showPhoto}
            alt="Inspection Photo"
            className="max-w-full max-h-full object-contain cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}
