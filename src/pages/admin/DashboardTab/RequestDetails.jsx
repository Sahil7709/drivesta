import React, { useState } from 'react';
import { FiUser, FiPhone, FiMapPin, FiCalendar, FiTruck, FiHome } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import AssignEngineer from './AssignEngineer';

export default function RequestDetails({ open, onClose, request, onAssign, setModalOpen }) {
  const [step, setStep] = useState(1);

  if (!open || !request) return null;

  const {
    customerName,
    customerMobile,
    address,
    _id: id,
    bookingId,
    date,
    brand,
    model,
    variant,
  } = request;

  const time = date ? new Date(date).toLocaleTimeString([]) : '';

  const handleAssign = (engineer, selectedSlot) => {
    if (onAssign) {
      onAssign(id, engineer, selectedSlot);
      setModalOpen(false);
      setStep(1);
    }
  };

  const InfoItem = ({ icon: Icon, children, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-2 bg-white p-2 rounded shadow hover:bg-green-50 transition"
    >
      <Icon className="text-button w-5 h-5" />
      <span className="text-sm text-gray-700">{children}</span>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            onClose();
            setModalOpen(false);
            setStep(1);
          }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="request-details"
                  initial={{ rotateY: 0, opacity: 1 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -180, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-2"
                >
                  <h3 className="text-button font-bold text-lg">Customer Info</h3>
                  <InfoItem icon={FiUser} delay={0.1}>Name: {customerName}</InfoItem>
                  <InfoItem icon={FiPhone} delay={0.2}>Phone: {customerMobile}</InfoItem>
                  <InfoItem icon={FiMapPin} delay={0.3}>Location: {address}</InfoItem>
                  <InfoItem icon={FiUser} delay={0.4}>Booking ID: {bookingId || id}</InfoItem>
                  <InfoItem icon={FiCalendar} delay={0.5}>Date: {date ? new Date(date).toLocaleDateString() : 'Not scheduled'}</InfoItem>

                  <h3 className="mt-2 text-button font-bold text-lg">Vehicle Info</h3>
                  <InfoItem icon={FiTruck} delay={0.6}>Brand: {brand}</InfoItem>
                  <InfoItem icon={FiTruck} delay={0.7}>Model: {model}</InfoItem>
                  <InfoItem icon={FiTruck} delay={0.8}>Variant: {variant}</InfoItem>

                  <h3 className="mt-2 text-button font-bold text-lg">Dealer Info</h3>
                  <InfoItem icon={FiHome} delay={0.9}>Address: {address}</InfoItem>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => { onClose(); setModalOpen(false); setStep(1); }}
                      className="bg-green-100 text-button px-3 py-1.5 rounded-lg font-bold border border-button hover:bg-green-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className="bg-button text-white px-3 py-1.5 rounded-lg font-bold hover:bg-green-500"
                    >
                      Continue to Assign Engineer
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="assign-engineer"
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 180, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <AssignEngineer
                    request={request}
                    onAssign={handleAssign}
                    selectedRequest={request}
                    selectedEngineerId={null}
                    setSelectedEngineerId={() => {}}
                    setSelectedSlot={() => {}}
                    selectedSlot={null}
                    onBack={() => setStep(1)}
                    setModalOpen={setModalOpen}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
