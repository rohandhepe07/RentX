/* =========================================================
   RentX — data layer
   ---------------------------------------------------------
   This file stands in for a real backend. Every function
   here is written the way a service call would be used
   (by name, returning the finished result) so that swapping
   the body for a `fetch()` call to a Spring Boot + MySQL/
   Postgres API later does not require touching any page's
   HTML or its calling code.

   Example of what that swap looks like down the line:

     function getListings(filters) {
       return fetch('/api/listings?' + new URLSearchParams(filters))
         .then(res => res.json());
     }

   For now, everything reads and writes localStorage under
   the "rentx:" namespace and is seeded with sample data on
   first load.
   ========================================================= */

const DB_KEYS = {
  users: "rentx:users",
  listings: "rentx:listings",
  bookings: "rentx:bookings",
  session: "rentx:session",
  seeded: "rentx:seeded_v1"
};

const CATEGORIES = [
  "Tools & Equipment",
  "Cameras & Electronics",
  "Party & Events",
  "Sports & Outdoors",
  "Vehicles",
  "Home & Garden",
  "Furniture"
];

/* ---------- low level storage helpers ---------- */
function readTable(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}
function writeTable(key, rows) {
  localStorage.setItem(key, JSON.stringify(rows));
}
function nextId(rows) {
  return rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
}

/* ---------- seed data (runs once) ---------- */
function seedIfNeeded() {
  if (localStorage.getItem(DB_KEYS.seeded)) return;

  const users = [
    { id: 1, name: "Admin",        email: "admin@rentx.app",   password: "admin123",  role: "admin",  area: "—",            joined: "2024-01-05" },
    { id: 2, name: "Priya Nair",    email: "priya@rentx.app",   password: "owner123",  role: "owner",  area: "Andheri West", joined: "2024-02-11" },
    { id: 3, name: "Rohan Mehta",   email: "rohan@rentx.app",   password: "owner123",  role: "owner",  area: "Powai",        joined: "2024-03-02" },
    { id: 4, name: "Sana Sheikh",   email: "sana@rentx.app",    password: "renter123", role: "renter", area: "Bandra East",  joined: "2024-04-19" },
    { id: 5, name: "Karan Bhosle",  email: "karan@rentx.app",   password: "renter123", role: "renter", area: "Thane West",   joined: "2024-05-08" }
  ];

  const listings = [
    { id: 1, ownerId: 2, title: "Bosch Cordless Drill Kit", category: "Tools & Equipment", description: "18V drill with two batteries, charger and a 40-piece bit set. Great for shelving, furniture assembly or small home fixes.", pricePerDay: 180, area: "Andheri West", status: "active", createdAt: "2024-06-01" },
    { id: 2, ownerId: 2, title: "Extension Ladder — 12 ft", category: "Tools & Equipment", description: "Aluminium extension ladder, rated up to 150kg. Good for gutter cleaning, painting or festive light setup.", pricePerDay: 120, area: "Andheri West", status: "active", createdAt: "2024-06-04" },
    { id: 3, ownerId: 3, title: "Canon EOS M50 Camera", category: "Cameras & Electronics", description: "Mirrorless camera with 15-45mm kit lens, extra battery and 32GB card. Ideal for weekend shoots and events.", pricePerDay: 450, area: "Powai", status: "active", createdAt: "2024-06-06" },
    { id: 4, ownerId: 3, title: "DJI Ronin Gimbal Stabiliser", category: "Cameras & Electronics", description: "3-axis gimbal for smooth handheld video, supports most mirrorless bodies up to 1.8kg.", pricePerDay: 350, area: "Powai", status: "active", createdAt: "2024-06-09" },
    { id: 5, ownerId: 2, title: "Folding Party Tent (6m x 3m)", category: "Party & Events", description: "Waterproof canopy tent with side walls, easy two-person setup. Comfortably shades 20-25 guests.", pricePerDay: 900, area: "Andheri West", status: "active", createdAt: "2024-06-11" },
    { id: 6, ownerId: 3, title: "Bluetooth PA Speaker with Mic", category: "Party & Events", description: "Portable 100W speaker, wireless mic included, 6-hour battery. Runs birthday parties and small gatherings well.", pricePerDay: 400, area: "Powai", status: "active", createdAt: "2024-06-14" },
    { id: 7, ownerId: 2, title: "Mountain Bike — 21 Speed", category: "Sports & Outdoors", description: "Well maintained hybrid mountain bike, frame size M, front suspension. Helmet included.", pricePerDay: 200, area: "Andheri West", status: "active", createdAt: "2024-06-17" },
    { id: 8, ownerId: 3, title: "4-Person Camping Tent", category: "Sports & Outdoors", description: "Double-layer waterproof tent, sets up in under 10 minutes. Comes with a repair kit and ground sheet.", pricePerDay: 250, area: "Powai", status: "active", createdAt: "2024-06-19" },
    { id: 9, ownerId: 2, title: "Honda Activa — Scooter", category: "Vehicles", description: "Automatic scooter, recently serviced, two helmets included. Valid documents shown at pickup.", pricePerDay: 500, area: "Andheri West", status: "active", createdAt: "2024-06-21" },
    { id: 10, ownerId: 3, title: "Pressure Washer — 120 Bar", category: "Home & Garden", description: "Electric pressure washer for driveways, cars and balconies. Includes two nozzle attachments.", pricePerDay: 300, area: "Powai", status: "active", createdAt: "2024-06-24" },
    { id: 11, ownerId: 2, title: "Study Table with Chair", category: "Furniture", description: "Compact wooden study table and ergonomic chair, good for a short stay or work-from-home setup.", pricePerDay: 150, area: "Andheri West", status: "active", createdAt: "2024-06-27" },
    { id: 12, ownerId: 3, title: "Steam Carpet Cleaner", category: "Home & Garden", description: "Upright carpet and upholstery cleaner, covers 300 sq ft on a full tank.", pricePerDay: 280, area: "Powai", status: "paused", createdAt: "2024-06-29" }
  ];

  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const c = new Date(d); c.setDate(c.getDate() + n); return c; };

  const bookings = [
    { id: 1, listingId: 3, renterId: 4, ownerId: 3, startDate: iso(addDays(today, 2)), endDate: iso(addDays(today, 4)), status: "pending",   totalPrice: 900,  createdAt: iso(addDays(today, -1)) },
    { id: 2, listingId: 1, renterId: 4, ownerId: 2, startDate: iso(addDays(today, -6)), endDate: iso(addDays(today, -4)), status: "completed", totalPrice: 360,  createdAt: iso(addDays(today, -8)) },
    { id: 3, listingId: 9, renterId: 5, ownerId: 2, startDate: iso(addDays(today, 5)), endDate: iso(addDays(today, 6)), status: "approved",  totalPrice: 500,  createdAt: iso(addDays(today, -2)) },
    { id: 4, listingId: 5, renterId: 5, ownerId: 2, startDate: iso(addDays(today, -12)), endDate: iso(addDays(today, -11)), status: "rejected", totalPrice: 900, createdAt: iso(addDays(today, -13)) }
  ];

  writeTable(DB_KEYS.users, users);
  writeTable(DB_KEYS.listings, listings);
  writeTable(DB_KEYS.bookings, bookings);
  localStorage.setItem(DB_KEYS.seeded, "true");
}
seedIfNeeded();

/* ---------- Users ---------- */
function findUserByEmail(email) {
  return readTable(DB_KEYS.users).find(u => u.email.toLowerCase() === String(email).toLowerCase());
}
function getUserById(id) {
  return readTable(DB_KEYS.users).find(u => u.id === Number(id));
}
function getAllUsers() {
  return readTable(DB_KEYS.users);
}
function createUser({ name, email, password, role, area }) {
  const users = readTable(DB_KEYS.users);
  if (findUserByEmail(email)) {
    throw new Error("An account with this email already exists.");
  }
  const user = {
    id: nextId(users),
    name, email, password, role,
    area: area || "—",
    joined: new Date().toISOString().slice(0, 10)
  };
  users.push(user);
  writeTable(DB_KEYS.users, users);
  return user;
}
function setUserStatus(userId, status) {
  const users = readTable(DB_KEYS.users);
  const u = users.find(x => x.id === Number(userId));
  if (u) { u.suspended = status === "suspended"; writeTable(DB_KEYS.users, users); }
}

/* ---------- Session (mock auth) ---------- */
function login(email, password, role) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    throw new Error("Email or password is incorrect.");
  }
  if (role && user.role !== role) {
    throw new Error(`This account is registered as ${user.role}, not ${role}.`);
  }
  if (user.suspended) {
    throw new Error("This account has been suspended. Contact support.");
  }
  localStorage.setItem(DB_KEYS.session, JSON.stringify({ userId: user.id }));
  return user;
}
function logout() {
  localStorage.removeItem(DB_KEYS.session);
}
function getCurrentUser() {
  try {
    const s = JSON.parse(localStorage.getItem(DB_KEYS.session));
    if (!s) return null;
    return getUserById(s.userId) || null;
  } catch (e) { return null; }
}
function requireRole(role) {
  const user = getCurrentUser();
  if (!user || user.role !== role) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

/* ---------- Listings ---------- */
function getListings(filters = {}) {
  let rows = readTable(DB_KEYS.listings);
  if (filters.status) rows = rows.filter(l => l.status === filters.status);
  if (filters.ownerId) rows = rows.filter(l => l.ownerId === Number(filters.ownerId));
  if (filters.category) rows = rows.filter(l => l.category === filters.category);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q)
    );
  }
  if (filters.area) {
    const a = filters.area.toLowerCase();
    rows = rows.filter(l => l.area.toLowerCase().includes(a));
  }
  return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
function getListingById(id) {
  return readTable(DB_KEYS.listings).find(l => l.id === Number(id));
}
function createListing(data) {
  const rows = readTable(DB_KEYS.listings);
  const listing = {
    id: nextId(rows),
    status: "active",
    createdAt: new Date().toISOString().slice(0, 10),
    ...data
  };
  rows.push(listing);
  writeTable(DB_KEYS.listings, rows);
  return listing;
}
function updateListing(id, changes) {
  const rows = readTable(DB_KEYS.listings);
  const l = rows.find(x => x.id === Number(id));
  if (!l) throw new Error("Listing not found.");
  Object.assign(l, changes);
  writeTable(DB_KEYS.listings, rows);
  return l;
}
function deleteListing(id) {
  let rows = readTable(DB_KEYS.listings);
  rows = rows.filter(l => l.id !== Number(id));
  writeTable(DB_KEYS.listings, rows);
}

/* ---------- Bookings ---------- */
function getBookings(filters = {}) {
  let rows = readTable(DB_KEYS.bookings);
  if (filters.renterId) rows = rows.filter(b => b.renterId === Number(filters.renterId));
  if (filters.ownerId) rows = rows.filter(b => b.ownerId === Number(filters.ownerId));
  if (filters.status) rows = rows.filter(b => b.status === filters.status);
  return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
function createBooking({ listingId, renterId, startDate, endDate }) {
  const listing = getListingById(listingId);
  if (!listing) throw new Error("Listing not found.");
  const days = Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / 86400000));
  const rows = readTable(DB_KEYS.bookings);
  const booking = {
    id: nextId(rows),
    listingId: Number(listingId),
    renterId: Number(renterId),
    ownerId: listing.ownerId,
    startDate, endDate,
    status: "pending",
    totalPrice: days * listing.pricePerDay,
    createdAt: new Date().toISOString().slice(0, 10)
  };
  rows.push(booking);
  writeTable(DB_KEYS.bookings, rows);
  return booking;
}
function updateBookingStatus(id, status) {
  const rows = readTable(DB_KEYS.bookings);
  const b = rows.find(x => x.id === Number(id));
  if (!b) throw new Error("Booking not found.");
  b.status = status;
  writeTable(DB_KEYS.bookings, rows);
  return b;
}

/* ---------- Formatting helpers ---------- */
function formatINR(n) {
  return "\u20B9" + Number(n).toLocaleString("en-IN");
}
function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function initials(name) {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}
