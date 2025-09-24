export const mockEngineers = [
  { id: 1, name: "Engineer A", location: "Pune", phone: "9090909090", active: true },
  { id: 2, name: "Engineer B", location: "PCMC", phone: "8888888888", active: true },
  { id: 3, name: "Engineer C", location: "PCMC", phone: "7777777777", active: false },
];

export const mockRequests = [
  {
    id: 1,
    bookingId: "DSS001",
    customerName: "Onkar Basawane",
    location: "PCMC",
    dealerAddress: "Nashik Phata",
    brand: "Hyundai",
    model: "i20",
    variant: "Sportz",
    phone: "9876543210",
    date: "2025-07-01",
    time: "11:30 AM",
    status: "new",
    slot: null
  },
  {
    id: 2,
    bookingId: "DSS002",
    customerName: "Amit Sharma",
    location: "Pune",
    dealerAddress: "Baner Showroom",
    brand: "Maruti",
    model: "Swift",
    variant: "VXI",
    phone: "9123456780",
    date: "2025-07-02",
    time: "01:00 PM",
    status: "assigned",
    assignedEngineer: "Engineer A",
    slot: "10:30 AM - 11:30 AM",
  },
  {
    id: 3,
    bookingId: "DSS003",
    customerName: "Sneha Patil",
    location: "PCMC",
    dealerAddress: "Akurdi Hub",
    brand: "Tata",
    model: "Punch",
    variant: "XZ",
    phone: "9988776655",
    date: "2025-07-01",
    time: "10:00 AM",
    status: "completed",
    assignedEngineer: "Engineer B",
    slot: "01:30 PM - 02:30 PM",
  },
  {
    id: 4,
    bookingId: "DSS004",
    customerName: "Pratik Patil",
    location: "PCMC",
    dealerAddress: "Chinchwad",
    brand: "Hyundai",
    model: "Venue",
    variant: "Sportz",
    phone: "9876543777",
    date: "2025-07-01",
    time: "11:30 AM",
    status: "new",
    slot: null
  },
  {
    id: 5,
    bookingId: "DSS005",
    customerName: "Pratik Patil",
    location: "PCMC",
    dealerAddress: "Chinchwad",
    brand: "Hyundai",
    model: "Venue",
    variant: "Sportz",
    phone: "9876543777",
    date: "2025-07-01",
    time: "11:30 AM",
    status: "new",
    slot: null
  },
  {
    id: 6,
    bookingId: "DSS006",
    customerName: "Pratik Patil",
    location: "PCMC",
    dealerAddress: "Chinchwad",
    brand: "Hyundai",
    model: "Venue",
    variant: "Sportz",
    phone: "9876543777",
    date: "2025-07-01",
    time: "11:30 AM",
    status: "new",
    slot: null
  },
  {
    id: 7,
    bookingId: "DSS007",
    customerName: "Pratik Patil",
    location: "PCMC",
    dealerAddress: "Chinchwad",
    brand: "Hyundai",
    model: "Venue",
    variant: "Sportz",
    phone: "9876543777",
    date: "2025-07-01",
    time: "11:30 AM",
    status: "new",
    slot: null
  },
  {
    id: 8,
    bookingId: "DSS008",
    customerName: "Pratik Patil",
    location: "PCMC",
    dealerAddress: "Chinchwad",
    brand: "Hyundai",
    model: "Venue",
    variant: "Sportz",
    phone: "9876543777",
    date: "2025-07-01",
    time: "11:30 AM",
    status: "new",
    slot: null
  }
];

export const timeSlots = [
  "10:30 AM - 11:30 AM",
  "01:30 PM - 02:30 PM",
  "04:30 PM - 05:30 PM",
];


  // const updatePaymentStatus = async (payment) => {
  //   const bookingId = payment._id;
  //   await new ApiService().apiput(ServerUrl.API_UPDATE_PAYMENT_STATUS + '/' + bookingId + '/payment-status', { paymentStatus: APPLICATION_CONSTANTS.PAYMENT_STATUS.PAID.value })
  //   alert('Payment status updated successfully');
  // };

  //   // setPayments(payments.map(p => p.bookingId === bookingId ? { ...p, paymentStatus: 'Paid' } : p));

  //   (formData.status == APPLICATION_CONSTANTS.REQUEST_STATUS.NEW.value || 
  //       formData.status == APPLICATION_CONSTANTS.REQUEST_STATUS.WAITING_FOR_APPROVAL.value || 
  //       formData.status == APPLICATION_CONSTANTS.REQUEST_STATUS.ASSIGNED_ENGINEER.value || 
  //       formData.status == APPLICATION_CONSTANTS.REQUEST_STATUS.IN_PROGRESS.value )
