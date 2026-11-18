import bcrypt from 'bcryptjs';

// Pre-seeded initial data
const initialCars = [
  {
    _id: '672000000000000000000001',
    make: 'Tesla',
    model: 'Model 3 Long Range',
    year: 2024,
    licensePlate: 'EV-300-TS',
    category: 'Electric',
    transmission: 'Automatic',
    fuelType: 'Electric',
    seatingCapacity: 5,
    dailyRate: 4500,
    status: 'available',
    mileage: 8200,
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1000&q=80',
    features: ['Autopilot', 'Navigation', 'Heated Seats', 'Glass Roof', 'Bluetooth'],
    location: 'Downtown Hub',
    owner: '671000000000000000000001',
    ownerName: 'System Admin',
    createdAt: new Date().toISOString()
  },
  {
    _id: '672000000000000000000002',
    make: 'BMW',
    model: '5 Series M Sport',
    year: 2023,
    licensePlate: 'BM-520-MS',
    category: 'Luxury',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seatingCapacity: 5,
    dailyRate: 7500,
    status: 'available',
    mileage: 15400,
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80',
    features: ['Leather Seats', 'Sunroof', 'Harman Kardon Audio', 'Parking Assist'],
    location: 'Airport Terminal 1',
    owner: '671000000000000000000001',
    ownerName: 'System Admin',
    createdAt: new Date().toISOString()
  },
  {
    _id: '672000000000000000000003',
    make: 'Toyota',
    model: 'RAV4 Hybrid',
    year: 2023,
    licensePlate: 'TY-442-HB',
    category: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    seatingCapacity: 5,
    dailyRate: 3500,
    status: 'available',
    mileage: 22000,
    imageUrl: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1000&q=80',
    features: ['All-Wheel Drive', 'Apple CarPlay', 'Adaptive Cruise', 'Backup Camera'],
    location: 'Downtown Hub',
    owner: '671000000000000000000002',
    ownerName: 'Alex Johnson',
    createdAt: new Date().toISOString()
  },
  {
    _id: '672000000000000000000004',
    make: 'Mercedes-Benz',
    model: 'C-Class Sedan',
    year: 2024,
    licensePlate: 'MB-202-CC',
    category: 'Sedan',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seatingCapacity: 5,
    dailyRate: 6500,
    status: 'available',
    mileage: 9100,
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80',
    features: ['Digital Cockpit', 'Ambient Lighting', 'Surround Sound', 'Blind Spot Assist'],
    location: 'Uptown Branch',
    owner: '671000000000000000000001',
    ownerName: 'System Admin',
    createdAt: new Date().toISOString()
  },
  {
    _id: '672000000000000000000005',
    make: 'Volkswagen',
    model: 'Golf TSI',
    year: 2022,
    licensePlate: 'VW-118-GF',
    category: 'Hatchback',
    transmission: 'Manual',
    fuelType: 'Petrol',
    seatingCapacity: 5,
    dailyRate: 2200,
    status: 'available',
    mileage: 31000,
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80',
    features: ['Eco Mode', 'Touchscreen Infotainment', 'Isofix', 'Cruise Control'],
    location: 'Downtown Hub',
    owner: '671000000000000000000002',
    ownerName: 'Alex Johnson',
    createdAt: new Date().toISOString()
  },
  {
    _id: '672000000000000000000006',
    make: 'Ford',
    model: 'Transit Passenger Van',
    year: 2023,
    licensePlate: 'FD-789-VN',
    category: 'Van',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    seatingCapacity: 12,
    dailyRate: 4800,
    status: 'available',
    mileage: 18500,
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
    features: ['High Roof', 'Luggage Space', 'Rear AC', 'Reverse Camera'],
    location: 'Airport Terminal 1',
    owner: '671000000000000000000001',
    ownerName: 'System Admin',
    createdAt: new Date().toISOString()
  }
];

class FallbackStore {
  constructor() {
    this.users = [];
    this.cars = initialCars.map((c) => ({ ...c, likes: [], likesCount: 0 }));
    this.rentals = [];
    this.carMessages = [];
    this.notifications = [];
    this.initDefaultUsers();
  }

  async initDefaultUsers() {
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('adminpassword123', salt);
    const customerPassword = await bcrypt.hash('password123', salt);

    this.users = [
      {
        _id: '671000000000000000000001',
        name: 'System Admin',
        email: 'admin@carrental.com',
        password: adminPassword,
        role: 'admin',
        phone: '+1 555-0100',
        drivingLicenseNumber: 'DL-ADMIN-9999',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: '671000000000000000000002',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: customerPassword,
        role: 'customer',
        phone: '+1 555-0199',
        drivingLicenseNumber: 'DL-NY-847291',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    // Initial sample rental
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 1);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 4);

    this.rentals = [
      {
        _id: '673000000000000000000001',
        customer: this.users[1],
        car: this.cars[0],
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalDays: 3,
        dailyRate: 95,
        totalAmount: 285,
        status: 'confirmed',
        pickupLocation: 'Downtown Hub',
        dropoffLocation: 'Downtown Hub',
        paymentStatus: 'paid',
        notes: 'Initial reservation for customer Alex Johnson',
        createdAt: new Date().toISOString()
      }
    ];
  }

  // --- Users ---
  findUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    const user = this.users.find((u) => u._id.toString() === id.toString());
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async createUser(userData) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const newUser = {
      _id: '671' + Date.now().toString(16).padStart(21, '0'),
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role: userData.role || 'customer',
      phone: userData.phone || '',
      drivingLicenseNumber: userData.drivingLicenseNumber || '',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUserProfile(userId, data) {
    const user = this.users.find((u) => u._id.toString() === userId.toString());
    if (!user) return null;
    if (data.name) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.drivingLicenseNumber !== undefined) user.drivingLicenseNumber = data.drivingLicenseNumber;
    return user;
  }

  // --- Cars ---
  getCars(filters = {}) {
    let result = [...this.cars];

    if (filters.category && filters.category !== 'All') {
      result = result.filter((c) => c.category === filters.category);
    }
    if (filters.status) {
      result = result.filter((c) => c.status === filters.status);
    }
    if (filters.minPrice) {
      result = result.filter((c) => c.dailyRate >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter((c) => c.dailyRate <= Number(filters.maxPrice));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.make.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }

    if (filters.sort === 'price_asc') {
      result.sort((a, b) => a.dailyRate - b.dailyRate);
    } else if (filters.sort === 'price_desc') {
      result.sort((a, b) => b.dailyRate - a.dailyRate);
    } else if (filters.sort === 'year_desc') {
      result.sort((a, b) => b.year - a.year);
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }

  getCarById(id) {
    return this.cars.find((c) => c._id.toString() === id.toString()) || null;
  }

  createCar(carData) {
    const newCar = {
      _id: '672' + Date.now().toString(16).padStart(21, '0'),
      make: carData.make,
      model: carData.model,
      year: Number(carData.year) || new Date().getFullYear(),
      licensePlate: carData.licensePlate,
      category: carData.category || 'Sedan',
      transmission: carData.transmission || 'Automatic',
      fuelType: carData.fuelType || 'Petrol',
      seatingCapacity: Number(carData.seatingCapacity) || 5,
      dailyRate: Number(carData.dailyRate) || 2500,
      status: carData.status || 'available',
      mileage: Number(carData.mileage) || 0,
      imageUrl:
        carData.imageUrl ||
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      features: Array.isArray(carData.features) ? carData.features : [],
      location: carData.location || 'Central Branch',
      owner: carData.owner || null,
      ownerName: carData.ownerName || 'DriveFlow Host',
      createdAt: new Date().toISOString()
    };
    this.cars.unshift(newCar);
    return newCar;
  }

  updateCar(id, updateData) {
    const index = this.cars.findIndex((c) => c._id.toString() === id.toString());
    if (index === -1) return null;
    this.cars[index] = { ...this.cars[index], ...updateData };
    return this.cars[index];
  }

  deleteCar(id) {
    const index = this.cars.findIndex((c) => c._id.toString() === id.toString());
    if (index === -1) return false;
    this.cars.splice(index, 1);
    // Also cancel any pending rentals
    this.rentals.forEach((r) => {
      const carId = (r.car?._id || r.car)?.toString();
      if (carId === id.toString() && r.status === 'pending') {
        r.status = 'cancelled';
        r.paymentStatus = 'refunded';
      }
    });
    return true;
  }

  toggleLikeCar(carId, userId) {
    const car = this.cars.find((c) => c._id.toString() === carId.toString());
    if (!car) return null;
    if (!car.likes) car.likes = [];
    const uidStr = userId.toString();
    const index = car.likes.findIndex((id) => id.toString() === uidStr);
    let isLiked = false;
    if (index === -1) {
      car.likes.push(uidStr);
      isLiked = true;
    } else {
      car.likes.splice(index, 1);
      isLiked = false;
    }
    car.likesCount = car.likes.length;
    return { isLiked, likesCount: car.likesCount };
  }

  getSavedCars(userId) {
    const uidStr = userId.toString();
    return this.cars.filter((c) => c.likes && c.likes.map((id) => id.toString()).includes(uidStr));
  }

  // --- Rentals ---
  createRental(rentalData) {
    const carOwner = rentalData.car?.owner?._id || rentalData.car?.owner;
    const newRental = {
      _id: '673' + Date.now().toString(16).padStart(21, '0'),
      customer: rentalData.customer,
      car: rentalData.car,
      host: carOwner ? carOwner.toString() : null,
      startDate: rentalData.startDate,
      endDate: rentalData.endDate,
      totalDays: rentalData.totalDays,
      dailyRate: rentalData.dailyRate,
      totalAmount: rentalData.totalAmount,
      status: 'pending', // Starts as pending until host approves (NO payment required yet!)
      pickupLocation: rentalData.pickupLocation,
      dropoffLocation: rentalData.dropoffLocation,
      tripDestination: rentalData.tripDestination || '',
      customerPhone: rentalData.customerPhone || '',
      customerLicense: rentalData.customerLicense || '',
      paymentStatus: 'unpaid', // Unpaid until approved
      paymentDetails: null,
      notes: rentalData.notes || '',
      createdAt: new Date().toISOString()
    };
    this.rentals.unshift(newRental);
    return newRental;
  }

  payRental(id, paymentDetails) {
    const rental = this.rentals.find((r) => r._id.toString() === id.toString());
    if (!rental) return null;
    rental.paymentStatus = 'paid';
    rental.status = 'confirmed';
    rental.paymentDetails = paymentDetails || {
      transactionId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
      method: 'UPI',
      paidAt: new Date().toISOString()
    };
    return rental;
  }

  getUserRentals(userId) {
    return this.rentals.filter(
      (r) =>
        (r.customer?._id || r.customer)?.toString() === userId.toString()
    );
  }

  getHostRentals(hostId) {
    return this.rentals.filter((r) => {
      const rentalHost = (r.host || r.car?.owner?._id || r.car?.owner)?.toString();
      return rentalHost === hostId.toString();
    });
  }

  getAllRentals() {
    return [...this.rentals];
  }

  getRentalById(id) {
    return this.rentals.find((r) => r._id.toString() === id.toString()) || null;
  }

  updateRentalStatus(id, newStatus) {
    const rental = this.rentals.find((r) => r._id.toString() === id.toString());
    if (!rental) return null;
    rental.status = newStatus;
    if (newStatus === 'cancelled' && rental.paymentStatus === 'paid') {
      rental.paymentStatus = 'refunded';
    }
    return rental;
  }

  // --- Car Discussion / Messages ---
  getCarMessages(carId) {
    return this.carMessages.filter((m) => m.car.toString() === carId.toString());
  }

  createCarMessage(data) {
    const msg = {
      _id: '674' + Date.now().toString(16).padStart(21, '0'),
      car: data.car,
      sender: data.sender,
      senderName: data.senderName,
      senderRole: data.senderRole || 'customer',
      recipient: data.recipient,
      subject: data.subject || 'Vehicle Inquiry',
      content: data.content,
      replies: [],
      createdAt: new Date().toISOString()
    };
    this.carMessages.unshift(msg);
    return msg;
  }

  replyCarMessage(messageId, replyData) {
    const msg = this.carMessages.find((m) => m._id.toString() === messageId.toString());
    if (!msg) return null;
    const reply = {
      _id: '675' + Date.now().toString(16).padStart(21, '0'),
      sender: replyData.sender,
      senderName: replyData.senderName,
      senderRole: replyData.senderRole || 'host',
      content: replyData.content,
      createdAt: new Date().toISOString()
    };
    msg.replies.push(reply);
    return msg;
  }

  getUserMessages(userId) {
    const uidStr = userId.toString();
    return this.carMessages.filter(
      (m) =>
        m.sender?.toString() === uidStr ||
        m.recipient?.toString() === uidStr ||
        m.replies?.some((r) => r.sender?.toString() === uidStr)
    );
  }

  // --- Notifications ---
  getUserNotifications(userId) {
    const uidStr = userId.toString();
    return this.notifications.filter((n) => n.recipient.toString() === uidStr);
  }

  createNotification(data) {
    const notif = {
      _id: '676' + Date.now().toString(16).padStart(21, '0'),
      recipient: data.recipient,
      title: data.title,
      message: data.message,
      type: data.type || 'new_request',
      link: data.link || '/my-rentals',
      isRead: false,
      relatedRental: data.relatedRental || null,
      relatedCar: data.relatedCar || null,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    return notif;
  }

  markNotificationAsRead(notifId, userId) {
    const notif = this.notifications.find(
      (n) => n._id.toString() === notifId.toString() && n.recipient.toString() === userId.toString()
    );
    if (notif) notif.isRead = true;
    return notif;
  }

  markAllNotificationsAsRead(userId) {
    const uidStr = userId.toString();
    this.notifications.forEach((n) => {
      if (n.recipient.toString() === uidStr) n.isRead = true;
    });
    return true;
  }
}

export const fallbackStore = new FallbackStore();

