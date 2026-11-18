import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Pre-seeded initial cars
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
    likes: [],
    likesCount: 0,
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
    likes: [],
    likesCount: 0,
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
    likes: [],
    likesCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    _id: '672000000000000000000004',
    make: 'Mercedes-Benz',
    model: 'C-Class Sedan',
    year: 2024,
    licensePlate: 'MB-202-CC',
    category: 'Luxury',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seatingCapacity: 5,
    dailyRate: 6800,
    status: 'available',
    mileage: 11000,
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80',
    features: ['Burmester Surround', 'Panoramic Roof', 'Ambient Lighting', 'Heated Seats'],
    location: 'Airport Terminal 1',
    owner: '671000000000000000000001',
    ownerName: 'System Admin',
    likes: [],
    likesCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    _id: '672000000000000000000005',
    make: 'Honda',
    model: 'Civic Sport',
    year: 2023,
    licensePlate: 'HN-108-CV',
    category: 'Sedan',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seatingCapacity: 5,
    dailyRate: 2600,
    status: 'available',
    mileage: 19000,
    imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1000&q=80',
    features: ['Lane Keeping Assist', 'Apple CarPlay', 'Android Auto', 'Fuel Efficient'],
    location: 'Downtown Hub',
    owner: '671000000000000000000002',
    ownerName: 'Alex Johnson',
    likes: [],
    likesCount: 0,
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
    likes: [],
    likesCount: 0,
    createdAt: new Date().toISOString()
  }
];

class FallbackStore {
  constructor() {
    this.users = [];
    this.cars = [];
    this.rentals = [];
    this.carMessages = [];
    this.notifications = [];
    this.initStore();
  }

  initStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        this.users = Array.isArray(data.users) ? data.users : [];
        this.cars = Array.isArray(data.cars) && data.cars.length > 0 ? data.cars : initialCars;
        this.rentals = Array.isArray(data.rentals) ? data.rentals : [];
        this.carMessages = Array.isArray(data.carMessages) ? data.carMessages : [];
        this.notifications = Array.isArray(data.notifications) ? data.notifications : [];
        console.log(`[Store] Loaded persistent store with ${this.users.length} users, ${this.cars.length} cars, ${this.rentals.length} rentals.`);
        return;
      }
    } catch (err) {
      console.error('[Store] Error reading persistent store, creating default:', err.message);
    }

    // Default seed setup
    const salt = bcrypt.genSaltSync(10);
    const adminPassword = bcrypt.hashSync('adminpassword123', salt);
    const customerPassword = bcrypt.hashSync('password123', salt);

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

    this.cars = initialCars;
    this.rentals = [];
    this.carMessages = [];
    this.notifications = [];
    this.saveToFile();
    console.log('[Store] Persistent store initialized at', STORE_FILE);
  }

  saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = {
        users: this.users,
        cars: this.cars,
        rentals: this.rentals,
        carMessages: this.carMessages,
        notifications: this.notifications
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Store] Failed to write persistent store:', err.message);
    }
  }

  // --- Users ---
  findUserByEmail(email) {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    return this.users.find((u) => u.email && u.email.trim().toLowerCase() === clean);
  }

  findUserById(id) {
    if (!id) return null;
    const user = this.users.find((u) => u._id.toString() === id.toString());
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async createUser(userData) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const cleanEmail = userData.email.trim().toLowerCase();

    // Check if user already exists
    const existingIndex = this.users.findIndex((u) => u.email.trim().toLowerCase() === cleanEmail);
    if (existingIndex !== -1) {
      // Update password & details
      this.users[existingIndex].password = hashedPassword;
      this.users[existingIndex].name = userData.name || this.users[existingIndex].name;
      this.users[existingIndex].phone = userData.phone || this.users[existingIndex].phone;
      this.users[existingIndex].drivingLicenseNumber =
        userData.drivingLicenseNumber || this.users[existingIndex].drivingLicenseNumber;
      this.saveToFile();
      return this.users[existingIndex];
    }

    const newUser = {
      _id: '671' + Date.now().toString(16).padStart(21, '0'),
      name: userData.name,
      email: cleanEmail,
      password: hashedPassword,
      role: userData.role || 'customer',
      phone: userData.phone || '',
      drivingLicenseNumber: userData.drivingLicenseNumber || '',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    this.saveToFile();
    return newUser;
  }

  updateUserProfile(userId, data) {
    const user = this.users.find((u) => u._id.toString() === userId.toString());
    if (!user) return null;
    if (data.name) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.drivingLicenseNumber !== undefined) user.drivingLicenseNumber = data.drivingLicenseNumber;
    this.saveToFile();
    return user;
  }

  getAllUsers() {
    return this.users;
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
      likes: [],
      likesCount: 0,
      createdAt: new Date().toISOString()
    };
    this.cars.unshift(newCar);
    this.saveToFile();
    return newCar;
  }

  updateCar(id, updateData) {
    const index = this.cars.findIndex((c) => c._id.toString() === id.toString());
    if (index === -1) return null;
    this.cars[index] = { ...this.cars[index], ...updateData };
    this.saveToFile();
    return this.cars[index];
  }

  deleteCar(id) {
    const index = this.cars.findIndex((c) => c._id.toString() === id.toString());
    if (index === -1) return false;
    this.cars.splice(index, 1);
    this.rentals.forEach((r) => {
      const carId = (r.car?._id || r.car)?.toString();
      if (carId === id.toString() && r.status === 'pending') {
        r.status = 'cancelled';
        r.paymentStatus = 'refunded';
      }
    });
    this.saveToFile();
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
    this.saveToFile();
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
      status: 'pending',
      pickupLocation: rentalData.pickupLocation,
      dropoffLocation: rentalData.dropoffLocation,
      tripDestination: rentalData.tripDestination || '',
      customerPhone: rentalData.customerPhone || '',
      customerLicense: rentalData.customerLicense || '',
      paymentStatus: 'unpaid',
      paymentDetails: null,
      notes: rentalData.notes || '',
      createdAt: new Date().toISOString()
    };
    this.rentals.unshift(newRental);
    this.saveToFile();
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
    this.saveToFile();
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
    this.saveToFile();
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
    this.saveToFile();
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
    this.saveToFile();
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
    this.saveToFile();
    return notif;
  }

  markNotificationAsRead(notifId, userId) {
    const notif = this.notifications.find(
      (n) => n._id.toString() === notifId.toString() && n.recipient.toString() === userId.toString()
    );
    if (notif) notif.isRead = true;
    this.saveToFile();
    return notif;
  }

  markAllNotificationsAsRead(userId) {
    const uidStr = userId.toString();
    this.notifications.forEach((n) => {
      if (n.recipient.toString() === uidStr) n.isRead = true;
    });
    this.saveToFile();
    return true;
  }
}

export const fallbackStore = new FallbackStore();
