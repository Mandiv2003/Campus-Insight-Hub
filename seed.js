// =============================================================================
// Smart Campus Operations Hub — MongoDB Seed Script
// Database: smartcampus
// Run with: mongosh smartcampus seed.js
//
// Spring Data MongoDB serialization conventions used here:
//   - LocalDateTime  → ISODate / new Date(...)
//   - LocalTime      → array [hour, minute, second, nano]  e.g. [8, 0, 0, 0]
//   - DayOfWeek enum → string name  e.g. "MONDAY"
//   - All other enums → string name
//   - _id            → UUID string (not ObjectId)
//   - Boolean fields stored under their @Field name (e.g. is_active, is_read)
// =============================================================================

// ── Helper: drop and recreate each collection ─────────────────────────────────
const collections = [
  "users",
  "resources",
  "bookings",
  "incident_tickets",
  "ticket_comments",
  "ticket_attachments",
  "notifications"
];

collections.forEach(name => {
  db.getCollection(name).drop();
  print("Dropped (if existed): " + name);
});

// =============================================================================
// 1. USERS
//    Bcrypt hash for "password123":
//    $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LjTa6T8EXii
// =============================================================================
const BCRYPT_PASSWORD = "$2b$10$C.J1yYilWkFGxs0ABt4JkuMXgFUa972t/MdSOB0VNCRl9k1rj45sK"; // password123

// Fixed user IDs — referenced by other collections
const U_ADMIN         = "a1b2c3d4-0001-0001-0001-000000000001";
const U_TECH_KASUN    = "a1b2c3d4-0002-0002-0002-000000000002";
const U_TECH_DILANI   = "a1b2c3d4-0003-0003-0003-000000000003";
const U_SACHINI       = "a1b2c3d4-0004-0004-0004-000000000004";
const U_RAVINDU       = "a1b2c3d4-0005-0005-0005-000000000005";
const U_NETHMI        = "a1b2c3d4-0006-0006-0006-000000000006";
const U_ASHAN         = "a1b2c3d4-0007-0007-0007-000000000007";

db.users.insertMany([
  {
    _id: U_ADMIN,
    email: "admin@sliit.lk",
    full_name: "Chamara Perera",
    avatar_url: null,
    provider: "local",
    provider_id: null,
    password_hash: BCRYPT_PASSWORD,
    username: "chamara.perera",
    role: "ADMIN",
    is_active: true,
    created_at: new Date("2025-08-01T08:00:00.000Z"),
    updated_at: new Date("2025-08-01T08:00:00.000Z")
  },
  {
    _id: U_TECH_KASUN,
    email: "kasun.bandara@sliit.lk",
    full_name: "Kasun Bandara",
    avatar_url: null,
    provider: "local",
    provider_id: null,
    password_hash: BCRYPT_PASSWORD,
    username: "kasun.bandara",
    role: "TECHNICIAN",
    is_active: true,
    created_at: new Date("2025-08-05T09:00:00.000Z"),
    updated_at: new Date("2025-08-05T09:00:00.000Z")
  },
  {
    _id: U_TECH_DILANI,
    email: "dilani.silva@sliit.lk",
    full_name: "Dilani Silva",
    avatar_url: null,
    provider: "local",
    provider_id: null,
    password_hash: BCRYPT_PASSWORD,
    username: "dilani.silva",
    role: "TECHNICIAN",
    is_active: true,
    created_at: new Date("2025-08-06T09:30:00.000Z"),
    updated_at: new Date("2025-08-06T09:30:00.000Z")
  },
  {
    _id: U_SACHINI,
    email: "sachini.jayawardena@students.sliit.lk",
    full_name: "Sachini Jayawardena",
    avatar_url: "https://lh3.googleusercontent.com/a/sachini_avatar",
    provider: "google",
    provider_id: "google-sub-sachini-001",
    password_hash: null,
    username: null,
    role: "USER",
    is_active: true,
    created_at: new Date("2025-09-01T07:45:00.000Z"),
    updated_at: new Date("2025-09-01T07:45:00.000Z")
  },
  {
    _id: U_RAVINDU,
    email: "ravindu.fernando@students.sliit.lk",
    full_name: "Ravindu Fernando",
    avatar_url: null,
    provider: "local",
    provider_id: null,
    password_hash: BCRYPT_PASSWORD,
    username: "ravindu.fernando",
    role: "USER",
    is_active: true,
    created_at: new Date("2025-09-02T08:10:00.000Z"),
    updated_at: new Date("2025-09-02T08:10:00.000Z")
  },
  {
    _id: U_NETHMI,
    email: "nethmi.wickramasinghe@students.sliit.lk",
    full_name: "Nethmi Wickramasinghe",
    avatar_url: "https://lh3.googleusercontent.com/a/nethmi_avatar",
    provider: "google",
    provider_id: "google-sub-nethmi-002",
    password_hash: null,
    username: null,
    role: "USER",
    is_active: true,
    created_at: new Date("2025-09-03T09:15:00.000Z"),
    updated_at: new Date("2025-09-03T09:15:00.000Z")
  },
  {
    _id: U_ASHAN,
    email: "ashan.rodrigo@students.sliit.lk",
    full_name: "Ashan Rodrigo",
    avatar_url: null,
    provider: "local",
    provider_id: null,
    password_hash: BCRYPT_PASSWORD,
    username: "ashan.rodrigo",
    role: "USER",
    is_active: true,
    created_at: new Date("2025-09-04T10:00:00.000Z"),
    updated_at: new Date("2025-09-04T10:00:00.000Z")
  }
]);
print("Inserted " + db.users.countDocuments() + " users.");

// =============================================================================
// 2. RESOURCES
//    availability_windows.start_time / end_time stored as [H, M, S, nano]
//    availability_windows.day_of_week stored as DayOfWeek string name
// =============================================================================

// Fixed resource IDs — referenced by bookings and incident_tickets
const R_LH401     = "b1c2d3e4-0001-0001-0001-000000000001";
const R_LAB3      = "b1c2d3e4-0002-0002-0002-000000000002";
const R_CONF_A    = "b1c2d3e4-0003-0003-0003-000000000003";
const R_PROJECTOR = "b1c2d3e4-0004-0004-0004-000000000004";
const R_LAB7      = "b1c2d3e4-0005-0005-0005-000000000005";
const R_SEMINAR   = "b1c2d3e4-0006-0006-0006-000000000006";
const R_MINIBUS      = "b1c2d3e4-0007-0007-0007-000000000007";
const R_STUDIO       = "b1c2d3e4-0008-0008-0008-000000000008";
const R_PHYSICS_LAB  = "b1c2d3e4-0009-0009-0009-000000000009";
const R_MEETING_B    = "b1c2d3e4-0010-0010-0010-000000000010";
const R_COWORK       = "b1c2d3e4-0011-0011-0011-000000000011";

function makeWindow(id, day, startH, endH) {
  return {
    id: id,
    day_of_week: day,
    start_time: { hour: startH, minute: 0, second: 0, nano: 0 },
    end_time:   { hour: endH,   minute: 0, second: 0, nano: 0 }
  };
}

// Standard weekday windows 08:00–17:00
function weekdayWindows(prefix) {
  return [
    makeWindow(prefix + "-mon", "MONDAY",    8, 17),
    makeWindow(prefix + "-tue", "TUESDAY",   8, 17),
    makeWindow(prefix + "-wed", "WEDNESDAY", 8, 17),
    makeWindow(prefix + "-thu", "THURSDAY",  8, 17),
    makeWindow(prefix + "-fri", "FRIDAY",    8, 17)
  ];
}

// Extended windows 08:00–20:00 (labs that stay open late)
function extendedWeekdayWindows(prefix) {
  return [
    makeWindow(prefix + "-mon", "MONDAY",    8, 20),
    makeWindow(prefix + "-tue", "TUESDAY",   8, 20),
    makeWindow(prefix + "-wed", "WEDNESDAY", 8, 20),
    makeWindow(prefix + "-thu", "THURSDAY",  8, 20),
    makeWindow(prefix + "-fri", "FRIDAY",    8, 20),
    makeWindow(prefix + "-sat", "SATURDAY",  9, 13)
  ];
}

db.resources.insertMany([
  {
    _id: R_LH401,
    name: "Lecture Hall 401",
    type: "LECTURE_HALL",
    capacity: 120,
    location: "Block A, Level 4",
    description: "Large air-conditioned lecture hall equipped with a 4K projector, wireless microphone system, and tiered seating. Suitable for full-batch lectures and presentations.",
    status: "ACTIVE",
    image_url: "/images/stitch/resource-auditorium.jpg",
    created_by_id: U_ADMIN,
    availability_windows: weekdayWindows("lh401"),
    created_at: new Date("2025-08-10T08:00:00.000Z"),
    updated_at: new Date("2025-08-10T08:00:00.000Z")
  },
  {
    _id: R_LAB3,
    name: "Computer Lab 3",
    type: "LAB",
    capacity: 40,
    location: "Block B, Level 2",
    description: "40-seat computer laboratory with Intel Core i7 workstations, 32 GB RAM each. Installed with Visual Studio Code, IntelliJ IDEA, Eclipse, MATLAB, and SPSS. High-speed fibre connection.",
    status: "ACTIVE",
    image_url: "/images/stitch/resource-computer-lab.jpg",
    created_by_id: U_ADMIN,
    availability_windows: extendedWeekdayWindows("lab3"),
    created_at: new Date("2025-08-10T08:30:00.000Z"),
    updated_at: new Date("2025-08-10T08:30:00.000Z")
  },
  {
    _id: R_CONF_A,
    name: "Conference Room A",
    type: "MEETING_ROOM",
    capacity: 20,
    location: "Block C, Level 1",
    description: "Executive conference room with a 75-inch smart display, video conferencing kit (Logitech Rally Plus), and whiteboard walls. Ideal for viva examinations, panel interviews, and project reviews.",
    status: "ACTIVE",
    image_url: "/images/stitch/resource-boardroom.jpg",
    created_by_id: U_ADMIN,
    availability_windows: weekdayWindows("confa"),
    created_at: new Date("2025-08-11T09:00:00.000Z"),
    updated_at: new Date("2025-08-11T09:00:00.000Z")
  },
  {
    _id: R_PROJECTOR,
    name: "Portable Projector Unit P-07",
    type: "EQUIPMENT",
    capacity: 1,
    location: "Equipment Store, Block A Ground Floor",
    description: "Epson EB-2250U WUXGA laser projector with 5000 lumens brightness. Includes HDMI cable, VGA adapter, remote, and carry case. Suitable for outdoor or auxiliary room presentations.",
    status: "ACTIVE",
    image_url: "/images/stitch/resource-projector.jpg",
    created_by_id: U_ADMIN,
    availability_windows: weekdayWindows("proj07"),
    created_at: new Date("2025-08-11T09:30:00.000Z"),
    updated_at: new Date("2025-08-11T09:30:00.000Z")
  },
  {
    _id: R_LAB7,
    name: "Networking Lab 7",
    type: "LAB",
    capacity: 30,
    location: "Block D, Level 3",
    description: "Dedicated networking and cybersecurity lab with Cisco switches, routers, and firewalls. Includes 30 workstations preloaded with Kali Linux, Wireshark, and Packet Tracer. Isolated VLAN environment.",
    status: "ACTIVE",
    image_url: "/images/stitch/resource-lab-2.jpg",
    created_by_id: U_ADMIN,
    availability_windows: extendedWeekdayWindows("lab7"),
    created_at: new Date("2025-08-12T08:00:00.000Z"),
    updated_at: new Date("2025-08-12T08:00:00.000Z")
  },
  {
    _id: R_SEMINAR,
    name: "Seminar Room S-02",
    type: "MEETING_ROOM",
    capacity: 50,
    location: "Block E, Level 2",
    description: "Flexible seminar room with movable furniture, dual projectors, and surround sound. Frequently used for guest lectures, workshops, and hackathon briefings.",
    status: "MAINTENANCE",
    image_url: "/images/stitch/resource-seminar.jpg",
    created_by_id: U_ADMIN,
    availability_windows: weekdayWindows("seminar02"),
    created_at: new Date("2025-08-12T09:00:00.000Z"),
    updated_at: new Date("2025-11-20T14:00:00.000Z")
  },
  {
    _id: R_MINIBUS,
    name: "Campus Minibus — KI-9432",
    type: "EQUIPMENT",
    capacity: 15,
    location: "Vehicle Bay, Main Gate",
    description: "15-seat air-conditioned Toyota Coaster. Available for official field trips, industrial visits, and approved extracurricular transport. Requires minimum 3 days advance booking.",
    status: "ACTIVE",
    image_url: null,
    created_by_id: U_ADMIN,
    availability_windows: [
      makeWindow("minibus-mon", "MONDAY",    8, 17),
      makeWindow("minibus-wed", "WEDNESDAY", 8, 17),
      makeWindow("minibus-fri", "FRIDAY",    8, 17)
    ],
    created_at: new Date("2025-08-13T10:00:00.000Z"),
    updated_at: new Date("2025-08-13T10:00:00.000Z")
  },
  {
    _id: R_STUDIO,
    name: "Media Production Studio",
    type: "LAB",
    capacity: 12,
    location: "Block F, Level 1",
    description: "Professional media studio with a green screen, ring lights, DSLR cameras, audio recording booth, and Adobe Creative Cloud workstations. Used by multimedia and IT students for project recordings and e-portfolio production.",
    status: "ACTIVE",
    image_url: null,
    created_by_id: U_ADMIN,
    availability_windows: [
      makeWindow("studio-mon", "MONDAY",    9, 18),
      makeWindow("studio-tue", "TUESDAY",   9, 18),
      makeWindow("studio-wed", "WEDNESDAY", 9, 18),
      makeWindow("studio-thu", "THURSDAY",  9, 18),
      makeWindow("studio-fri", "FRIDAY",    9, 18),
      makeWindow("studio-sat", "SATURDAY",  9, 14)
    ],
    created_at: new Date("2025-08-14T08:00:00.000Z"),
    updated_at: new Date("2025-08-14T08:00:00.000Z")
  },
  {
    _id: R_PHYSICS_LAB,
    name: "Physics & Electronics Lab",
    type: "LAB",
    capacity: 24,
    location: "Block G, Level 2",
    description: "Advanced electronics and physics laboratory equipped with oscilloscopes, function generators, power supplies, and soldering stations. Used for EE and IoT practical sessions. Includes a dedicated microcontroller workbench with Arduino and Raspberry Pi kits.",
    status: "ACTIVE",
    image_url: "/images/stitch/resource-physics-lab.jpg",
    created_by_id: U_ADMIN,
    availability_windows: weekdayWindows("physlab"),
    created_at: new Date("2025-08-15T08:00:00.000Z"),
    updated_at: new Date("2025-08-15T08:00:00.000Z")
  },
  {
    _id: R_MEETING_B,
    name: "Meeting Room B",
    type: "MEETING_ROOM",
    capacity: 12,
    location: "Block C, Level 2",
    description: "Mid-sized meeting room with a 55-inch display, HDMI connectivity, and a round table seating 12. Ideal for smaller team reviews, module coordinator meetings, and student consultations with lecturers.",
    status: "ACTIVE",
    image_url: "/images/stitch/resource-meeting-room.jpg",
    created_by_id: U_ADMIN,
    availability_windows: weekdayWindows("meetb"),
    created_at: new Date("2025-08-15T09:00:00.000Z"),
    updated_at: new Date("2025-08-15T09:00:00.000Z")
  },
  {
    _id: R_COWORK,
    name: "Collaborative Study Lounge",
    type: "MEETING_ROOM",
    capacity: 35,
    location: "Block E, Ground Floor",
    description: "Open-plan collaborative study space with modular furniture, whiteboards, and high-speed Wi-Fi. Bookable for group study sessions, hackathon prep, and project sprints. Includes a kitchenette and lockers for day use.",
    status: "ACTIVE",
    image_url: "/images/stitch/resource-cowork.jpg",
    created_by_id: U_ADMIN,
    availability_windows: [
      makeWindow("cowork-mon", "MONDAY",    8, 21),
      makeWindow("cowork-tue", "TUESDAY",   8, 21),
      makeWindow("cowork-wed", "WEDNESDAY", 8, 21),
      makeWindow("cowork-thu", "THURSDAY",  8, 21),
      makeWindow("cowork-fri", "FRIDAY",    8, 21),
      makeWindow("cowork-sat", "SATURDAY",  9, 18),
      makeWindow("cowork-sun", "SUNDAY",    10, 16)
    ],
    created_at: new Date("2025-08-16T08:00:00.000Z"),
    updated_at: new Date("2025-08-16T08:00:00.000Z")
  }
]);
print("Inserted " + db.resources.countDocuments() + " resources.");

// =============================================================================
// 3. BOOKINGS
// =============================================================================

const B1  = "c1d2e3f4-0001-0001-0001-000000000001";
const B2  = "c1d2e3f4-0002-0002-0002-000000000002";
const B3  = "c1d2e3f4-0003-0003-0003-000000000003";
const B4  = "c1d2e3f4-0004-0004-0004-000000000004";
const B5  = "c1d2e3f4-0005-0005-0005-000000000005";
const B6  = "c1d2e3f4-0006-0006-0006-000000000006";
const B7  = "c1d2e3f4-0007-0007-0007-000000000007";
const B8  = "c1d2e3f4-0008-0008-0008-000000000008";
const B9  = "c1d2e3f4-0009-0009-0009-000000000009";
const B10 = "c1d2e3f4-0010-0010-0010-000000000010";

db.bookings.insertMany([
  {
    _id: B1,
    resource_id: R_LH401,
    resource_name: "Lecture Hall 401",
    requested_by_id: U_SACHINI,
    requested_by_name: "Sachini Jayawardena",
    reviewed_by_id: U_ADMIN,
    reviewed_by_name: "Chamara Perera",
    title: "Software Engineering Final Presentations — Group 7",
    purpose: "Year 3 SE cohort final project presentations. Six groups of five students presenting to panel of lecturers. Each presentation is 20 minutes with 10 minutes Q&A.",
    expected_attendees: 45,
    start_datetime: new Date("2026-04-10T09:00:00.000Z"),
    end_datetime:   new Date("2026-04-10T13:00:00.000Z"),
    status: "APPROVED",
    rejection_reason: null,
    cancellation_note: null,
    reviewed_at: new Date("2026-04-03T11:20:00.000Z"),
    created_at: new Date("2026-04-02T14:30:00.000Z"),
    updated_at: new Date("2026-04-03T11:20:00.000Z")
  },
  {
    _id: B2,
    resource_id: R_LAB3,
    resource_name: "Computer Lab 3",
    requested_by_id: U_RAVINDU,
    requested_by_name: "Ravindu Fernando",
    reviewed_by_id: null,
    reviewed_by_name: null,
    title: "Database Systems Practical Session — CS3062",
    purpose: "Hands-on SQL and MongoDB lab session for CS3062 module. Students will complete exercises on query optimisation and indexing strategies.",
    expected_attendees: 35,
    start_datetime: new Date("2026-04-14T13:00:00.000Z"),
    end_datetime:   new Date("2026-04-14T16:00:00.000Z"),
    status: "PENDING",
    rejection_reason: null,
    cancellation_note: null,
    reviewed_at: null,
    created_at: new Date("2026-04-04T09:05:00.000Z"),
    updated_at: new Date("2026-04-04T09:05:00.000Z")
  },
  {
    _id: B3,
    resource_id: R_CONF_A,
    resource_name: "Conference Room A",
    requested_by_id: U_NETHMI,
    requested_by_name: "Nethmi Wickramasinghe",
    reviewed_by_id: U_ADMIN,
    reviewed_by_name: "Chamara Perera",
    title: "IT Project Viva — Team Nexus",
    purpose: "Final year individual project viva voce examination. Candidate: Nethmi Wickramasinghe. Project title: Real-time Sign Language Recognition Using CNN. Panel of two examiners.",
    expected_attendees: 4,
    start_datetime: new Date("2026-04-08T10:00:00.000Z"),
    end_datetime:   new Date("2026-04-08T11:30:00.000Z"),
    status: "APPROVED",
    rejection_reason: null,
    cancellation_note: null,
    reviewed_at: new Date("2026-04-03T15:00:00.000Z"),
    created_at: new Date("2026-04-02T16:00:00.000Z"),
    updated_at: new Date("2026-04-03T15:00:00.000Z")
  },
  {
    _id: B4,
    resource_id: R_PROJECTOR,
    resource_name: "Portable Projector Unit P-07",
    requested_by_id: U_ASHAN,
    requested_by_name: "Ashan Rodrigo",
    reviewed_by_id: U_ADMIN,
    reviewed_by_name: "Chamara Perera",
    title: "IEEE Student Branch Tech Talk",
    purpose: "Monthly IEEE Student Branch tech talk event. Speaker presenting on cloud-native architectures. Event held in the foyer area which has no fixed projector.",
    expected_attendees: 60,
    start_datetime: new Date("2026-04-11T14:00:00.000Z"),
    end_datetime:   new Date("2026-04-11T16:30:00.000Z"),
    status: "REJECTED",
    rejection_reason: "Projector P-07 is currently booked for calibration maintenance on that date. Please select an alternative date or use the projector in Block B foyer.",
    cancellation_note: null,
    reviewed_at: new Date("2026-04-03T16:45:00.000Z"),
    created_at: new Date("2026-04-03T08:00:00.000Z"),
    updated_at: new Date("2026-04-03T16:45:00.000Z")
  },
  {
    _id: B5,
    resource_id: R_LAB7,
    resource_name: "Networking Lab 7",
    requested_by_id: U_SACHINI,
    requested_by_name: "Sachini Jayawardena",
    reviewed_by_id: null,
    reviewed_by_name: null,
    title: "Ethical Hacking Workshop — Capture The Flag",
    purpose: "Inter-faculty CTF competition warm-up practice. Students from the Cybersecurity and Networking specialisations will run penetration testing exercises on the isolated lab environment.",
    expected_attendees: 28,
    start_datetime: new Date("2026-04-17T09:00:00.000Z"),
    end_datetime:   new Date("2026-04-17T17:00:00.000Z"),
    status: "PENDING",
    rejection_reason: null,
    cancellation_note: null,
    reviewed_at: null,
    created_at: new Date("2026-04-04T11:30:00.000Z"),
    updated_at: new Date("2026-04-04T11:30:00.000Z")
  },
  {
    _id: B6,
    resource_id: R_STUDIO,
    resource_name: "Media Production Studio",
    requested_by_id: U_RAVINDU,
    requested_by_name: "Ravindu Fernando",
    reviewed_by_id: U_ADMIN,
    reviewed_by_name: "Chamara Perera",
    title: "Final Year Project Demo Video Recording",
    purpose: "Recording a 10-minute project demonstration video for the IT3161 module submission. Project: Smart Inventory Management System. Requires green screen and lighting setup.",
    expected_attendees: 5,
    start_datetime: new Date("2026-04-07T10:00:00.000Z"),
    end_datetime:   new Date("2026-04-07T13:00:00.000Z"),
    status: "APPROVED",
    rejection_reason: null,
    cancellation_note: null,
    reviewed_at: new Date("2026-04-04T08:15:00.000Z"),
    created_at: new Date("2026-04-03T17:00:00.000Z"),
    updated_at: new Date("2026-04-04T08:15:00.000Z")
  },
  {
    _id: B7,
    resource_id: R_LH401,
    resource_name: "Lecture Hall 401",
    requested_by_id: U_ASHAN,
    requested_by_name: "Ashan Rodrigo",
    reviewed_by_id: U_ADMIN,
    reviewed_by_name: "Chamara Perera",
    title: "Cloud Computing Guest Lecture — AWS Solutions Architect",
    purpose: "Guest lecture by senior AWS Solutions Architect on cloud migration strategies. Open to all Year 3 and Year 4 students. Expected full attendance.",
    expected_attendees: 110,
    start_datetime: new Date("2026-04-09T14:00:00.000Z"),
    end_datetime:   new Date("2026-04-09T16:00:00.000Z"),
    status: "APPROVED",
    rejection_reason: null,
    cancellation_note: null,
    reviewed_at: new Date("2026-04-02T10:00:00.000Z"),
    created_at: new Date("2026-04-01T15:00:00.000Z"),
    updated_at: new Date("2026-04-02T10:00:00.000Z")
  },
  {
    _id: B8,
    resource_id: R_MINIBUS,
    resource_name: "Campus Minibus — KI-9432",
    requested_by_id: U_NETHMI,
    requested_by_name: "Nethmi Wickramasinghe",
    reviewed_by_id: U_ADMIN,
    reviewed_by_name: "Chamara Perera",
    title: "Industrial Visit — Dialog Axiata PLC HQ",
    purpose: "Annual industrial visit to Dialog Axiata headquarters in Colombo 3. Students from the Telecommunications module. Departure 07:30, return by 16:00.",
    expected_attendees: 14,
    start_datetime: new Date("2026-04-15T07:30:00.000Z"),
    end_datetime:   new Date("2026-04-15T16:00:00.000Z"),
    status: "CANCELLED",
    rejection_reason: null,
    cancellation_note: "Visit postponed to next semester due to examination timetable conflict. Driver informed.",
    reviewed_at: new Date("2026-03-28T11:00:00.000Z"),
    created_at: new Date("2026-03-25T09:00:00.000Z"),
    updated_at: new Date("2026-04-01T14:00:00.000Z")
  },
  {
    _id: B9,
    resource_id: R_CONF_A,
    resource_name: "Conference Room A",
    requested_by_id: U_ASHAN,
    requested_by_name: "Ashan Rodrigo",
    reviewed_by_id: null,
    reviewed_by_name: null,
    title: "PAF Module Group Review Meeting",
    purpose: "Internal progress review for IT3030 PAF assignment. All four module members meeting with project supervisor Dr. Priyanka Muthukumarana to demo current implementation.",
    expected_attendees: 6,
    start_datetime: new Date("2026-04-18T14:00:00.000Z"),
    end_datetime:   new Date("2026-04-18T15:30:00.000Z"),
    status: "PENDING",
    rejection_reason: null,
    cancellation_note: null,
    reviewed_at: null,
    created_at: new Date("2026-04-05T07:30:00.000Z"),
    updated_at: new Date("2026-04-05T07:30:00.000Z")
  },
  {
    _id: B10,
    resource_id: R_LAB3,
    resource_name: "Computer Lab 3",
    requested_by_id: U_SACHINI,
    requested_by_name: "Sachini Jayawardena",
    reviewed_by_id: U_ADMIN,
    reviewed_by_name: "Chamara Perera",
    title: "Machine Learning Practical — Model Training Session",
    purpose: "Supervised lab session for IT3022 Machine Learning module. Students will train CNN models using TensorFlow/Keras on the lab GPU workstations. Dataset: CIFAR-10.",
    expected_attendees: 38,
    start_datetime: new Date("2026-03-28T08:00:00.000Z"),
    end_datetime:   new Date("2026-03-28T12:00:00.000Z"),
    status: "APPROVED",
    rejection_reason: null,
    cancellation_note: null,
    reviewed_at: new Date("2026-03-22T10:30:00.000Z"),
    created_at: new Date("2026-03-20T14:00:00.000Z"),
    updated_at: new Date("2026-03-22T10:30:00.000Z")
  }
]);
print("Inserted " + db.bookings.countDocuments() + " bookings.");

// =============================================================================
// 4. INCIDENT TICKETS
// =============================================================================

const T1 = "d1e2f3a4-0001-0001-0001-000000000001";
const T2 = "d1e2f3a4-0002-0002-0002-000000000002";
const T3 = "d1e2f3a4-0003-0003-0003-000000000003";
const T4 = "d1e2f3a4-0004-0004-0004-000000000004";
const T5 = "d1e2f3a4-0005-0005-0005-000000000005";
const T6 = "d1e2f3a4-0006-0006-0006-000000000006";
const T7 = "d1e2f3a4-0007-0007-0007-000000000007";
const T8 = "d1e2f3a4-0008-0008-0008-000000000008";
const T9 = "d1e2f3a4-0009-0009-0009-000000000009";

db.incident_tickets.insertMany([
  {
    _id: T1,
    resource_id: R_LAB3,
    resource_name: "Computer Lab 3",
    reported_by_id: U_RAVINDU,
    reported_by_name: "Ravindu Fernando",
    assigned_to_id: U_TECH_KASUN,
    assigned_to_name: "Kasun Bandara",
    title: "5 workstations in Computer Lab 3 fail to boot — BIOS error on POST",
    description: "Workstations number 12, 17, 18, 23, and 31 are displaying a BIOS POST failure screen (error code 0x0000007B) on startup. They were functioning normally yesterday afternoon. The remaining 35 machines are operational. This is causing disruption to the Database Systems practical sessions scheduled this week.",
    category: "IT_EQUIPMENT",
    priority: "HIGH",
    location_detail: "Computer Lab 3, Block B Level 2 — workstations along the east wall row 3 and row 4",
    contact_phone: "0771234567",
    contact_email: "ravindu.fernando@students.sliit.lk",
    status: "IN_PROGRESS",
    resolution_notes: null,
    rejection_reason: null,
    resolved_at: null,
    created_at: new Date("2026-04-03T07:45:00.000Z"),
    updated_at: new Date("2026-04-03T10:20:00.000Z")
  },
  {
    _id: T2,
    resource_id: null,
    resource_name: null,
    reported_by_id: U_SACHINI,
    reported_by_name: "Sachini Jayawardena",
    assigned_to_id: U_TECH_DILANI,
    assigned_to_name: "Dilani Silva",
    title: "Water leak from ceiling in Block A Level 3 corridor near Room 305",
    description: "There is an active water leak dripping from the false ceiling at approximately 2 metres from the entrance of Room 305 in Block A Level 3. The leak appears to be coming from a pipe above the ceiling tiles. Puddles are forming on the floor creating a slip hazard. Placed warning cones already but permanent fix is needed urgently.",
    category: "PLUMBING",
    priority: "CRITICAL",
    location_detail: "Block A Level 3 corridor, approximately 2 m from Room 305 entrance",
    contact_phone: "0779876543",
    contact_email: "sachini.jayawardena@students.sliit.lk",
    status: "IN_PROGRESS",
    resolution_notes: null,
    rejection_reason: null,
    resolved_at: null,
    created_at: new Date("2026-04-04T08:15:00.000Z"),
    updated_at: new Date("2026-04-04T09:30:00.000Z")
  },
  {
    _id: T3,
    resource_id: R_LH401,
    resource_name: "Lecture Hall 401",
    reported_by_id: U_ASHAN,
    reported_by_name: "Ashan Rodrigo",
    assigned_to_id: U_TECH_KASUN,
    assigned_to_name: "Kasun Bandara",
    title: "Air conditioning unit in Lecture Hall 401 making loud rattling noise",
    description: "The left-side ceiling-mounted AC unit in LH401 is producing a persistent loud rattling/vibrating sound during operation. It started approximately 3 days ago and is becoming increasingly disruptive to lectures. The unit is still cooling but the noise level is above 60 dB making it difficult to hear the lecturer. Please inspect and repair before the final presentations on 10 April.",
    category: "HVAC",
    priority: "MEDIUM",
    location_detail: "Lecture Hall 401, Block A Level 4 — left-side ceiling AC unit (unit number AC-LH401-L)",
    contact_phone: "0712345678",
    contact_email: "ashan.rodrigo@students.sliit.lk",
    status: "RESOLVED",
    resolution_notes: "Technician inspected the unit on 5 April 2026. Found a loose fan blade mounting screw causing the vibration. Tightened all mounting screws and replaced two worn-out rubber dampeners. AC unit tested — operating silently and efficiently. No further action required.",
    rejection_reason: null,
    resolved_at: new Date("2026-04-05T11:30:00.000Z"),
    created_at: new Date("2026-04-02T13:00:00.000Z"),
    updated_at: new Date("2026-04-05T11:30:00.000Z")
  },
  {
    _id: T4,
    resource_id: null,
    resource_name: null,
    reported_by_id: U_NETHMI,
    reported_by_name: "Nethmi Wickramasinghe",
    assigned_to_id: null,
    assigned_to_name: null,
    title: "Main entrance automatic door sensor not detecting persons — door stays closed",
    description: "The automatic sliding door at the main entrance of Block C is not opening automatically. The motion sensor above the door does not appear to be detecting people walking towards it. Users have to manually push the door open. This is a safety and accessibility concern, especially for students with mobility difficulties and those carrying heavy equipment.",
    category: "ELECTRICAL",
    priority: "MEDIUM",
    location_detail: "Block C main entrance, ground floor automatic sliding door",
    contact_phone: "0756789012",
    contact_email: "nethmi.wickramasinghe@students.sliit.lk",
    status: "OPEN",
    resolution_notes: null,
    rejection_reason: null,
    resolved_at: null,
    created_at: new Date("2026-04-04T15:30:00.000Z"),
    updated_at: new Date("2026-04-04T15:30:00.000Z")
  },
  {
    _id: T5,
    resource_id: R_LAB7,
    resource_name: "Networking Lab 7",
    reported_by_id: U_RAVINDU,
    reported_by_name: "Ravindu Fernando",
    assigned_to_id: U_TECH_DILANI,
    assigned_to_name: "Dilani Silva",
    title: "Core Cisco switch in Networking Lab 7 shows amber port status on uplinks",
    description: "The core Cisco Catalyst 2960 switch (hostname: SW-LAB7-CORE) located in the server rack in Networking Lab 7 is showing amber port status lights on all four uplink ports (GigabitEthernet0/25 to 0/28). This is causing intermittent network drops for all 30 workstations in the lab. Affected since this morning approximately 06:30. Verified using show interface status command — ports are showing err-disabled state.",
    category: "IT_EQUIPMENT",
    priority: "HIGH",
    location_detail: "Networking Lab 7, Block D Level 3 — server rack, Cisco Catalyst 2960 (rack position 3U)",
    contact_phone: "0771234567",
    contact_email: "ravindu.fernando@students.sliit.lk",
    status: "RESOLVED",
    resolution_notes: "Port security violation was the root cause — a rogue device had been plugged into one of the access ports triggering err-disabled on the uplinks. Cleared err-disabled state using 'shutdown / no shutdown' on affected ports and configured port security with mac-address sticky to prevent recurrence. All 30 workstations restored to full connectivity. Switch firmware also updated to 15.2(7)E8.",
    rejection_reason: null,
    resolved_at: new Date("2026-04-03T16:00:00.000Z"),
    created_at: new Date("2026-04-03T08:30:00.000Z"),
    updated_at: new Date("2026-04-03T16:00:00.000Z")
  },
  {
    _id: T6,
    resource_id: null,
    resource_name: null,
    reported_by_id: U_ASHAN,
    reported_by_name: "Ashan Rodrigo",
    assigned_to_id: null,
    assigned_to_name: null,
    title: "Cracked floor tile creating trip hazard — Block B ground floor near lift",
    description: "There is a severely cracked and partially lifted floor tile near the lift entrance on the ground floor of Block B. The raised edge of the tile is approximately 2 cm high and is a significant trip hazard. Two students have already reported nearly tripping on it. The area is high-traffic between 08:00 and 10:00 daily. Immediate temporary barrier and permanent replacement required.",
    category: "SAFETY",
    priority: "HIGH",
    location_detail: "Block B ground floor, approximately 1.5 m from lift entrance doors",
    contact_phone: "0712345678",
    contact_email: "ashan.rodrigo@students.sliit.lk",
    status: "OPEN",
    resolution_notes: null,
    rejection_reason: null,
    resolved_at: null,
    created_at: new Date("2026-04-05T06:55:00.000Z"),
    updated_at: new Date("2026-04-05T06:55:00.000Z")
  },
  {
    _id: T7,
    resource_id: R_STUDIO,
    resource_name: "Media Production Studio",
    reported_by_id: U_NETHMI,
    reported_by_name: "Nethmi Wickramasinghe",
    assigned_to_id: U_TECH_KASUN,
    assigned_to_name: "Kasun Bandara",
    title: "Studio audio interface not recognised by workstation — recording blocked",
    description: "The Focusrite Scarlett 18i20 audio interface in the Media Production Studio is not being detected by any of the three Adobe Audition workstations. Device Manager shows 'Unknown USB Device (Device Descriptor Request Failed)'. The interface powers on (green LED) but USB handshake fails. This is blocking all audio recording projects including several final year submissions due this week.",
    category: "IT_EQUIPMENT",
    priority: "CRITICAL",
    location_detail: "Media Production Studio, Block F Level 1 — audio recording booth workstation rack",
    contact_phone: "0756789012",
    contact_email: "nethmi.wickramasinghe@students.sliit.lk",
    status: "REJECTED",
    resolution_notes: null,
    rejection_reason: "After investigation, the audio interface failure was caused by physical liquid damage to the USB controller IC on the device board — this is a user-inflicted hardware fault not covered under campus maintenance. The unit must be sent for manufacturer repair at the student's faculty's expense. IT department cannot carry out component-level PCB repair. Please submit a procurement request for a replacement unit.",
    resolved_at: null,
    created_at: new Date("2026-04-01T11:00:00.000Z"),
    updated_at: new Date("2026-04-02T14:30:00.000Z")
  },
  {
    _id: T8,
    resource_id: null,
    resource_name: null,
    reported_by_id: U_SACHINI,
    reported_by_name: "Sachini Jayawardena",
    assigned_to_id: U_TECH_DILANI,
    assigned_to_name: "Dilani Silva",
    title: "Fire exit sign light not working on Block A Level 2 east stairwell",
    description: "The illuminated fire exit sign at the top of the east stairwell on Level 2 of Block A is not lit. The sign was observed to be dark during the morning inspection. This is a safety compliance issue — the sign must be operational at all times per fire safety regulations. There may also be a fault with the emergency lighting on the same circuit as the sign was last inspected 6 months ago.",
    category: "SAFETY",
    priority: "HIGH",
    location_detail: "Block A Level 2, east stairwell exit sign above stairwell door",
    contact_phone: "0779876543",
    contact_email: "sachini.jayawardena@students.sliit.lk",
    status: "CLOSED",
    resolution_notes: "Replaced faulty fluorescent tube and starter unit in the fire exit sign housing. Emergency lighting circuit tested — all emergency luminaires on Levels 1–4 of Block A are now functional and logged. Monthly inspection schedule updated. Fire safety officer sign-off obtained.",
    rejection_reason: null,
    resolved_at: new Date("2026-03-30T15:00:00.000Z"),
    created_at: new Date("2026-03-28T08:00:00.000Z"),
    updated_at: new Date("2026-03-30T15:00:00.000Z")
  },
  {
    _id: T9,
    resource_id: null,
    resource_name: null,
    reported_by_id: U_SACHINI,
    reported_by_name: "Sachini Jayawardena",
    assigned_to_id: U_TECH_KASUN,
    assigned_to_name: "Kasun Bandara",
    title: "Burnt and damaged electrical outlet in Block D Level 1 corridor",
    description: "A double electrical outlet on the wall of the Block D Level 1 corridor (near the water dispenser) is visibly burnt and damaged. The faceplate is charred black and one of the sockets has melted plastic around the earth pin. A second adjacent outlet is cracked with exposed wiring visible at the bottom. Both outlets should be isolated and replaced immediately as they pose a fire and electrocution hazard.",
    category: "ELECTRICAL",
    priority: "CRITICAL",
    location_detail: "Block D Level 1 corridor, wall adjacent to the water dispenser — two double-gang sockets, positions W-D1-04 and W-D1-05",
    contact_phone: "0779876543",
    contact_email: "sachini.jayawardena@students.sliit.lk",
    status: "IN_PROGRESS",
    resolution_notes: null,
    rejection_reason: null,
    resolved_at: null,
    created_at: new Date("2026-04-06T07:30:00.000Z"),
    updated_at: new Date("2026-04-06T09:15:00.000Z")
  }
]);
print("Inserted " + db.incident_tickets.countDocuments() + " incident tickets.");

// =============================================================================
// 5. TICKET COMMENTS
//    Field name: body (not "content") — confirmed from TicketComment.java
//    is_edited stored as boolean
// =============================================================================

db.ticket_comments.insertMany([
  {
    _id: "e1f2a3b4-0001-0001-0001-000000000001",
    ticket_id: T1,
    author_id: U_TECH_KASUN,
    author_name: "Kasun Bandara",
    author_avatar_url: null,
    body: "I have attended the lab and confirmed the issue. All five affected workstations are showing BIOS error 0x0000007B which typically indicates a disk controller or boot device failure. I've pulled workstations 12 and 17 off the bench for initial diagnosis — suspected SATA cable failure or SSD corruption. Will update with findings after running diagnostics.",
    is_edited: false,
    created_at: new Date("2026-04-03T10:20:00.000Z"),
    updated_at: new Date("2026-04-03T10:20:00.000Z")
  },
  {
    _id: "e1f2a3b4-0002-0002-0002-000000000002",
    ticket_id: T1,
    author_id: U_RAVINDU,
    author_name: "Ravindu Fernando",
    author_avatar_url: null,
    body: "Thank you for attending so promptly. Just to add — workstation 23 also has a physical issue with the USB ports. Two of the four front USB ports are loose. Not sure if related but flagging it while you're here. The practical session today has been moved to Computer Lab 4 as a workaround.",
    is_edited: false,
    created_at: new Date("2026-04-03T11:05:00.000Z"),
    updated_at: new Date("2026-04-03T11:05:00.000Z")
  },
  {
    _id: "e1f2a3b4-0003-0003-0003-000000000003",
    ticket_id: T2,
    author_id: U_TECH_DILANI,
    author_name: "Dilani Silva",
    author_avatar_url: null,
    body: "On site now. The leak is confirmed — it's coming from a corroded section of the 22mm copper water supply pipe above the false ceiling near the toilet block on Level 4 directly above. I have shut off the local valve to that section and the dripping has stopped. The false ceiling tiles are waterlogged and will need replacing. Will isolate the pipe section and arrange a plumber for permanent repair tomorrow morning. Please keep the cones in place overnight.",
    is_edited: false,
    created_at: new Date("2026-04-04T09:30:00.000Z"),
    updated_at: new Date("2026-04-04T09:30:00.000Z")
  },
  {
    _id: "e1f2a3b4-0004-0004-0004-000000000004",
    ticket_id: T3,
    author_id: U_TECH_KASUN,
    author_name: "Kasun Bandara",
    author_avatar_url: null,
    body: "Inspected AC unit AC-LH401-L. Root cause identified: loose fan blade mounting screw on the indoor blower unit causing the blade to contact the scroll casing during high-speed operation. This is a common issue after extended use. Scheduled repair for tomorrow morning (5 April) at 07:00 before the hall opens. Will bring replacement rubber dampeners from the store.",
    is_edited: false,
    created_at: new Date("2026-04-04T14:00:00.000Z"),
    updated_at: new Date("2026-04-04T14:00:00.000Z")
  },
  {
    _id: "e1f2a3b4-0005-0005-0005-000000000005",
    ticket_id: T5,
    author_id: U_TECH_DILANI,
    author_name: "Dilani Silva",
    author_avatar_url: null,
    body: "Ran diagnostics on SW-LAB7-CORE. Found port security violation — a non-authorised MAC address was learned on access port GigabitEthernet0/14 which triggered err-disabled on all uplink trunk ports. Cleared the violation and applied sticky MAC security policy. Switch is back online. All 30 workstations confirmed reachable via ping sweep. Will document this configuration change in the network log register.",
    is_edited: false,
    created_at: new Date("2026-04-03T15:45:00.000Z"),
    updated_at: new Date("2026-04-03T15:45:00.000Z")
  },
  {
    _id: "e1f2a3b4-0006-0006-0006-000000000006",
    ticket_id: T7,
    author_id: U_TECH_KASUN,
    author_name: "Kasun Bandara",
    author_avatar_url: null,
    body: "Examined the Focusrite Scarlett 18i20. The USB-C port on the device has visible corrosion and the PCB around the USB controller shows signs of liquid ingress — blue-green oxidation on the solder joints. This is physical damage not a driver or OS issue. The device has been replaced on the official student equipment inventory as damaged beyond field repair. Reporting to admin for rejection of ticket under the campus maintenance scope.",
    is_edited: false,
    created_at: new Date("2026-04-02T13:00:00.000Z"),
    updated_at: new Date("2026-04-02T13:00:00.000Z")
  }
]);
print("Inserted " + db.ticket_comments.countDocuments() + " ticket comments.");

// =============================================================================
// 6. TICKET ATTACHMENTS
//    file_path mirrors the real storage path pattern: uploads/tickets/{ticketId}/
// =============================================================================

db.ticket_attachments.insertMany([
  {
    _id: "f1a2b3c4-0001-0001-0001-000000000001",
    ticket_id: T1,
    uploaded_by_id: U_RAVINDU,
    uploaded_by_name: "Ravindu Fernando",
    file_name: "workstation_bios_error_ws12.jpg",
    file_path: "uploads/tickets/" + T1 + "/workstation_bios_error_ws12.jpg",
    file_size: 1872340,
    content_type: "image/jpeg",
    created_at: new Date("2026-04-03T07:50:00.000Z")
  },
  {
    _id: "f1a2b3c4-0002-0002-0002-000000000002",
    ticket_id: T1,
    uploaded_by_id: U_RAVINDU,
    uploaded_by_name: "Ravindu Fernando",
    file_name: "workstation_bios_error_ws17.jpg",
    file_path: "uploads/tickets/" + T1 + "/workstation_bios_error_ws17.jpg",
    file_size: 1654210,
    content_type: "image/jpeg",
    created_at: new Date("2026-04-03T07:52:00.000Z")
  },
  {
    _id: "f1a2b3c4-0003-0003-0003-000000000003",
    ticket_id: T2,
    uploaded_by_id: U_SACHINI,
    uploaded_by_name: "Sachini Jayawardena",
    file_name: "ceiling_leak_block_a_level3.jpg",
    file_path: "uploads/tickets/" + T2 + "/ceiling_leak_block_a_level3.jpg",
    file_size: 2341876,
    content_type: "image/jpeg",
    created_at: new Date("2026-04-04T08:20:00.000Z")
  },
  {
    _id: "f1a2b3c4-0004-0004-0004-000000000004",
    ticket_id: T5,
    uploaded_by_id: U_RAVINDU,
    uploaded_by_name: "Ravindu Fernando",
    file_name: "switch_amber_ports_sw_lab7_core.png",
    file_path: "uploads/tickets/" + T5 + "/switch_amber_ports_sw_lab7_core.png",
    file_size: 987654,
    content_type: "image/png",
    created_at: new Date("2026-04-03T08:35:00.000Z")
  },
  {
    _id: "f1a2b3c4-0005-0005-0005-000000000005",
    ticket_id: T6,
    uploaded_by_id: U_ASHAN,
    uploaded_by_name: "Ashan Rodrigo",
    file_name: "cracked_tile_block_b_gf_lift.jpg",
    file_path: "uploads/tickets/" + T6 + "/cracked_tile_block_b_gf_lift.jpg",
    file_size: 1456789,
    content_type: "image/jpeg",
    created_at: new Date("2026-04-05T07:00:00.000Z")
  },
  {
    _id: "f1a2b3c4-0006-0006-0006-000000000006",
    ticket_id: T7,
    uploaded_by_id: U_NETHMI,
    uploaded_by_name: "Nethmi Wickramasinghe",
    file_name: "focusrite_device_manager_error.png",
    file_path: "uploads/tickets/" + T7 + "/focusrite_device_manager_error.png",
    file_size: 543210,
    content_type: "image/png",
    created_at: new Date("2026-04-01T11:10:00.000Z")
  },
  {
    _id: "f1a2b3c4-0007-0007-0007-000000000007",
    ticket_id: T3,
    uploaded_by_id: U_ASHAN,
    uploaded_by_name: "Ashan Rodrigo",
    file_name: "incident-ac-unit.jpg",
    file_path: "uploads/tickets/" + T3 + "/incident-ac-unit.jpg",
    file_size: 1923410,
    content_type: "image/jpeg",
    created_at: new Date("2026-04-02T13:10:00.000Z")
  },
  {
    _id: "f1a2b3c4-0008-0008-0008-000000000008",
    ticket_id: T6,
    uploaded_by_id: U_ASHAN,
    uploaded_by_name: "Ashan Rodrigo",
    file_name: "incident-floor-plan.jpg",
    file_path: "uploads/tickets/" + T6 + "/incident-floor-plan.jpg",
    file_size: 876540,
    content_type: "image/jpeg",
    created_at: new Date("2026-04-05T07:05:00.000Z")
  },
  {
    _id: "f1a2b3c4-0009-0009-0009-000000000009",
    ticket_id: T9,
    uploaded_by_id: U_SACHINI,
    uploaded_by_name: "Sachini Jayawardena",
    file_name: "incident-charred-outlet.jpg",
    file_path: "uploads/tickets/" + T9 + "/incident-charred-outlet.jpg",
    file_size: 2145670,
    content_type: "image/jpeg",
    created_at: new Date("2026-04-06T07:33:00.000Z")
  },
  {
    _id: "f1a2b3c4-0010-0010-0010-000000000010",
    ticket_id: T9,
    uploaded_by_id: U_SACHINI,
    uploaded_by_name: "Sachini Jayawardena",
    file_name: "incident-damaged-outlet.jpg",
    file_path: "uploads/tickets/" + T9 + "/incident-damaged-outlet.jpg",
    file_size: 1987320,
    content_type: "image/jpeg",
    created_at: new Date("2026-04-06T07:34:00.000Z")
  }
]);
print("Inserted " + db.ticket_attachments.countDocuments() + " ticket attachments.");

// =============================================================================
// 7. NOTIFICATIONS
//    Fields: recipient_id, type, title, message, entity_type, entity_id,
//            is_read, created_at
//    NotificationType values: BOOKING_APPROVED, BOOKING_REJECTED,
//      BOOKING_CANCELLED, TICKET_STATUS_CHANGED, TICKET_ASSIGNED,
//      TICKET_COMMENT_ADDED
// =============================================================================

db.notifications.insertMany([
  {
    _id: "91a2b3c4-0001-0001-0001-000000000001",
    recipient_id: U_SACHINI,
    type: "BOOKING_APPROVED",
    title: "Booking Approved",
    message: "Your booking 'Software Engineering Final Presentations — Group 7' for Lecture Hall 401 on 10 April 2026 has been approved.",
    entity_type: "BOOKING",
    entity_id: B1,
    is_read: true,
    created_at: new Date("2026-04-03T11:20:00.000Z")
  },
  {
    _id: "91a2b3c4-0002-0002-0002-000000000002",
    recipient_id: U_NETHMI,
    type: "BOOKING_APPROVED",
    title: "Booking Approved",
    message: "Your booking 'IT Project Viva — Team Nexus' for Conference Room A on 8 April 2026 has been approved.",
    entity_type: "BOOKING",
    entity_id: B3,
    is_read: true,
    created_at: new Date("2026-04-03T15:00:00.000Z")
  },
  {
    _id: "91a2b3c4-0003-0003-0003-000000000003",
    recipient_id: U_ASHAN,
    type: "BOOKING_REJECTED",
    title: "Booking Rejected",
    message: "Your booking 'IEEE Student Branch Tech Talk' for Portable Projector Unit P-07 has been rejected. Reason: Projector P-07 is currently booked for calibration maintenance on that date. Please select an alternative date.",
    entity_type: "BOOKING",
    entity_id: B4,
    is_read: false,
    created_at: new Date("2026-04-03T16:45:00.000Z")
  },
  {
    _id: "91a2b3c4-0004-0004-0004-000000000004",
    recipient_id: U_RAVINDU,
    type: "BOOKING_APPROVED",
    title: "Booking Approved",
    message: "Your booking 'Final Year Project Demo Video Recording' for Media Production Studio on 7 April 2026 has been approved.",
    entity_type: "BOOKING",
    entity_id: B6,
    is_read: false,
    created_at: new Date("2026-04-04T08:15:00.000Z")
  },
  {
    _id: "91a2b3c4-0005-0005-0005-000000000005",
    recipient_id: U_NETHMI,
    type: "BOOKING_CANCELLED",
    title: "Booking Cancelled",
    message: "Your booking 'Industrial Visit — Dialog Axiata PLC HQ' has been cancelled. Note: Visit postponed to next semester due to examination timetable conflict.",
    entity_type: "BOOKING",
    entity_id: B8,
    is_read: true,
    created_at: new Date("2026-04-01T14:00:00.000Z")
  },
  {
    _id: "91a2b3c4-0006-0006-0006-000000000006",
    recipient_id: U_TECH_KASUN,
    type: "TICKET_ASSIGNED",
    title: "Ticket Assigned to You",
    message: "You have been assigned to incident ticket: '5 workstations in Computer Lab 3 fail to boot — BIOS error on POST'. Please review and respond.",
    entity_type: "TICKET",
    entity_id: T1,
    is_read: true,
    created_at: new Date("2026-04-03T09:00:00.000Z")
  },
  {
    _id: "91a2b3c4-0007-0007-0007-000000000007",
    recipient_id: U_TECH_DILANI,
    type: "TICKET_ASSIGNED",
    title: "Ticket Assigned to You",
    message: "You have been assigned to incident ticket: 'Water leak from ceiling in Block A Level 3 corridor near Room 305'. Please attend immediately — CRITICAL priority.",
    entity_type: "TICKET",
    entity_id: T2,
    is_read: true,
    created_at: new Date("2026-04-04T08:30:00.000Z")
  },
  {
    _id: "91a2b3c4-0008-0008-0008-000000000008",
    recipient_id: U_ASHAN,
    type: "TICKET_STATUS_CHANGED",
    title: "Ticket Resolved",
    message: "Your incident ticket 'Air conditioning unit in Lecture Hall 401 making loud rattling noise' has been marked as RESOLVED. Loose fan blade mounting screw tightened and rubber dampeners replaced.",
    entity_type: "TICKET",
    entity_id: T3,
    is_read: false,
    created_at: new Date("2026-04-05T11:30:00.000Z")
  },
  {
    _id: "91a2b3c4-0009-0009-0009-000000000009",
    recipient_id: U_RAVINDU,
    type: "TICKET_COMMENT_ADDED",
    title: "New Comment on Your Ticket",
    message: "Kasun Bandara added a comment on your ticket '5 workstations in Computer Lab 3 fail to boot — BIOS error on POST'.",
    entity_type: "TICKET",
    entity_id: T1,
    is_read: false,
    created_at: new Date("2026-04-03T10:20:00.000Z")
  },
  {
    _id: "91a2b3c4-0010-0010-0010-000000000010",
    recipient_id: U_NETHMI,
    type: "TICKET_STATUS_CHANGED",
    title: "Ticket Rejected",
    message: "Your incident ticket 'Studio audio interface not recognised by workstation — recording blocked' has been rejected. Reason: Physical liquid damage found on device — not covered under campus maintenance scope.",
    entity_type: "TICKET",
    entity_id: T7,
    is_read: true,
    created_at: new Date("2026-04-02T14:30:00.000Z")
  },
  {
    _id: "91a2b3c4-0011-0011-0011-000000000011",
    recipient_id: U_TECH_KASUN,
    type: "TICKET_ASSIGNED",
    title: "Ticket Assigned to You",
    message: "You have been assigned to incident ticket: 'Burnt and damaged electrical outlet in Block D Level 1 corridor'. CRITICAL priority — please isolate the outlets immediately.",
    entity_type: "TICKET",
    entity_id: T9,
    is_read: false,
    created_at: new Date("2026-04-06T09:15:00.000Z")
  },
  {
    _id: "91a2b3c4-0012-0012-0012-000000000012",
    recipient_id: U_SACHINI,
    type: "TICKET_STATUS_CHANGED",
    title: "Ticket In Progress",
    message: "Your incident ticket 'Burnt and damaged electrical outlet in Block D Level 1 corridor' is now IN PROGRESS. Kasun Bandara has been assigned.",
    entity_type: "TICKET",
    entity_id: T9,
    is_read: false,
    created_at: new Date("2026-04-06T09:15:00.000Z")
  }
]);
print("Inserted " + db.notifications.countDocuments() + " notifications.");

// =============================================================================
// Summary
// =============================================================================
print("\n========== Seed Complete ==========");
print("users              : " + db.users.countDocuments());
print("resources          : " + db.resources.countDocuments());
print("bookings           : " + db.bookings.countDocuments());
print("incident_tickets   : " + db.incident_tickets.countDocuments());
print("ticket_comments    : " + db.ticket_comments.countDocuments());
print("ticket_attachments : " + db.ticket_attachments.countDocuments());
print("notifications      : " + db.notifications.countDocuments());
print("====================================\n");
