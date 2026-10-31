import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'studiospace_db';

if (!uri) {
  console.error('MONGODB_URI environment variable is missing.');
  process.exit(1);
}

const seedStudios = [
  {
    _id: new ObjectId(),
    ownerId: 'demo_host_mahfuz',
    ownerEmail: 'mahfuzhasan2700@gmail.com',
    ownerName: 'Mahfuz Hasan',
    ownerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    title: 'Northlight Daylight & Cyc Studio',
    category: 'photo-studio',
    hourlyRateCents: 5500,
    securityDepositCents: 5000,
    currency: 'USD',
    maxCapacity: 12,
    address: {
      line1: '124 Tejgaon Industrial Area',
      area: 'Tejgaon',
      city: 'Dhaka',
      country: 'BD'
    },
    imageUrls: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      'Daylight Windows',
      'White Cyclorama',
      'Profoto Lighting Kit',
      'Motorized Backdrops',
      'High-Speed WiFi',
      'Makeup & Vanity Station',
      'Steamer & Wardrobe Rack'
    ],
    overview: 'A 2,200 sq ft daylight photography studio featuring an expansive 20x20 ft corner cyclorama wall and full blackout curtains. Ideal for fashion editorials, commercial lookbooks, and high-key creative portraiture.',
    timezone: 'Asia/Dhaka',
    operatingHours: {
      monday: [{ start: '08:00', end: '20:00' }],
      tuesday: [{ start: '08:00', end: '20:00' }],
      wednesday: [{ start: '08:00', end: '20:00' }],
      thursday: [{ start: '08:00', end: '20:00' }],
      friday: [{ start: '08:00', end: '22:00' }],
      saturday: [{ start: '09:00', end: '22:00' }],
      sunday: [{ start: '09:00', end: '18:00' }]
    },
    unavailablePeriods: [],
    availabilityVersion: 1,
    rating: 4.95,
    reviewCount: 28,
    createdAt: new Date('2026-10-15T09:00:00Z'),
    updatedAt: new Date('2026-10-15T09:00:00Z')
  },
  {
    _id: new ObjectId(),
    ownerId: 'demo_host_sarah',
    ownerEmail: 'sarah.cinematics@studiospace.io',
    ownerName: 'Sarah Jenkins',
    ownerImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    title: 'Sound Stage 4B with Lighting Grid',
    category: 'film-stage',
    hourlyRateCents: 11000,
    securityDepositCents: 10000,
    currency: 'USD',
    maxCapacity: 25,
    address: {
      line1: '78 Film City Road',
      area: 'Uttara',
      city: 'Dhaka',
      country: 'BD'
    },
    imageUrls: [
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      'Full Soundproofing (STC 65)',
      'Overhead Pipe Grid (18ft Clearance)',
      'Green Screen Backdrop (16x24 ft)',
      '3-Phase 100A Camlock Power',
      'Silent Air Conditioning',
      'Production Crew Lounge',
      'Drive-In Loading Bay'
    ],
    overview: 'Broadcast-grade cinematic sound stage engineered for dialogue capture, music video shoots, and episodic television. Complete acoustic decoupling ensures zero interference from surrounding traffic.',
    timezone: 'Asia/Dhaka',
    operatingHours: {
      monday: [{ start: '07:00', end: '23:00' }],
      tuesday: [{ start: '07:00', end: '23:00' }],
      wednesday: [{ start: '07:00', end: '23:00' }],
      thursday: [{ start: '07:00', end: '23:00' }],
      friday: [{ start: '07:00', end: '23:00' }],
      saturday: [{ start: '08:00', end: '23:00' }],
      sunday: [{ start: '08:00', end: '20:00' }]
    },
    unavailablePeriods: [],
    availabilityVersion: 1,
    rating: 5.0,
    reviewCount: 19,
    createdAt: new Date('2026-10-18T10:30:00Z'),
    updatedAt: new Date('2026-10-18T10:30:00Z')
  },
  {
    _id: new ObjectId(),
    ownerId: 'demo_host_alex',
    ownerEmail: 'alex.audio@studiospace.io',
    ownerName: 'Alex Rivera',
    ownerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    title: 'EchoBox 4K Multi-Cam Podcast Lounge',
    category: 'podcast-lounge',
    hourlyRateCents: 4500,
    securityDepositCents: 3000,
    currency: 'USD',
    maxCapacity: 6,
    address: {
      line1: '45 Creative Quarter, Road 11',
      area: 'Banani',
      city: 'Dhaka',
      country: 'BD'
    },
    imageUrls: [
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      '4x Shure SM7B Microphones',
      '3x Sony 4K PTZ Cameras',
      'Rodecaster Pro II Audio Board',
      'ATEM Mini Extreme ISO Switcher',
      'Acoustic Felt Slatted Walls',
      'Live Streaming Gigabit Fiber',
      'Warm Leather Club Armchairs'
    ],
    overview: 'Turnkey video podcast recording studio styled with warm timber and dimmable tube lighting. Walk in with a micro-SD card and walk out with multi-track audio and ISO video recordings ready for post-production.',
    timezone: 'Asia/Dhaka',
    operatingHours: {
      monday: [{ start: '09:00', end: '21:00' }],
      tuesday: [{ start: '09:00', end: '21:00' }],
      wednesday: [{ start: '09:00', end: '21:00' }],
      thursday: [{ start: '09:00', end: '21:00' }],
      friday: [{ start: '09:00', end: '21:00' }],
      saturday: [{ start: '10:00', end: '20:00' }],
      sunday: [{ start: '10:00', end: '18:00' }]
    },
    unavailablePeriods: [],
    availabilityVersion: 1,
    rating: 4.88,
    reviewCount: 34,
    createdAt: new Date('2026-10-20T14:15:00Z'),
    updatedAt: new Date('2026-10-20T14:15:00Z')
  },
  {
    _id: new ObjectId(),
    ownerId: 'demo_host_marcus',
    ownerEmail: 'marcus.sound@studiospace.io',
    ownerName: 'Marcus Vance',
    ownerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    title: 'Resonance Music Suite & Vocal Booth',
    category: 'music-suite',
    hourlyRateCents: 6500,
    securityDepositCents: 5000,
    currency: 'USD',
    maxCapacity: 5,
    address: {
      line1: '12 Green Heritage Avenue',
      area: 'Dhanmondi',
      city: 'Dhaka',
      country: 'BD'
    },
    imageUrls: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      'Genelec 8351B Studio Monitors',
      'Universal Audio Apollo x8p',
      'Isolated Vocal Isolation Booth',
      'Neumann U87 Ai Condenser Mic',
      'Komplete Kontrol S88 Piano',
      'Acoustic Bass Traps & Diffusers',
      'Logic Pro X & Ableton Live Suite'
    ],
    overview: 'Precision-tuned mixing, tracking, and vocal recording suite. Designed with floating wood floors, double-door acoustic airlock, and Class-A outboard preamplifiers for artists who demand pristine acoustic reproduction.',
    timezone: 'Asia/Dhaka',
    operatingHours: {
      monday: [{ start: '10:00', end: '24:00' }],
      tuesday: [{ start: '10:00', end: '24:00' }],
      wednesday: [{ start: '10:00', end: '24:00' }],
      thursday: [{ start: '10:00', end: '24:00' }],
      friday: [{ start: '10:00', end: '24:00' }],
      saturday: [{ start: '11:00', end: '24:00' }],
      sunday: [{ start: '11:00', end: '22:00' }]
    },
    unavailablePeriods: [],
    availabilityVersion: 1,
    rating: 4.92,
    reviewCount: 22,
    createdAt: new Date('2026-10-22T11:00:00Z'),
    updatedAt: new Date('2026-10-22T11:00:00Z')
  },
  {
    _id: new ObjectId(),
    ownerId: 'demo_host_elena',
    ownerEmail: 'elena.art@studiospace.io',
    ownerName: 'Elena Rostova',
    ownerImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    title: 'Artisan Screen-Printing & Craft Loft',
    category: 'workshop',
    hourlyRateCents: 4000,
    securityDepositCents: 2500,
    currency: 'USD',
    maxCapacity: 16,
    address: {
      line1: '90 Old Dhaka Heritage Lane',
      area: 'Lalbagh',
      city: 'Dhaka',
      country: 'BD'
    },
    imageUrls: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      '6-Color Screen Printing Carousel',
      'Washout Booth with Pressure Washer',
      'Heavy-Duty Solid Oak Workbenches',
      'Pottery Wheels & Kiln Access',
      'North-Facing Skylights',
      'Slop Sink & Solvent Disposal Area',
      'Drying Racks & Light Exposure Unit'
    ],
    overview: 'Spacious 1,800 sq ft tactile artist workshop filled with natural northern skylight. Ideal for textile designers, printmakers, sculptors, and creative cohort workshops seeking dedicated messy-work craft infrastructure.',
    timezone: 'Asia/Dhaka',
    operatingHours: {
      monday: [{ start: '08:00', end: '19:00' }],
      tuesday: [{ start: '08:00', end: '19:00' }],
      wednesday: [{ start: '08:00', end: '19:00' }],
      thursday: [{ start: '08:00', end: '19:00' }],
      friday: [{ start: '08:00', end: '19:00' }],
      saturday: [{ start: '09:00', end: '18:00' }],
      sunday: [{ start: '10:00', end: '17:00' }]
    },
    unavailablePeriods: [],
    availabilityVersion: 1,
    rating: 4.85,
    reviewCount: 15,
    createdAt: new Date('2026-10-24T08:30:00Z'),
    updatedAt: new Date('2026-10-24T08:30:00Z')
  },
  {
    _id: new ObjectId(),
    ownerId: 'demo_host_tariq',
    ownerEmail: 'tariq.visuals@studiospace.io',
    ownerName: 'Tariq Al-Mansoor',
    ownerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    title: 'Apex Virtual Production & Motion Cyc',
    category: 'film-stage',
    hourlyRateCents: 9500,
    securityDepositCents: 8000,
    currency: 'USD',
    maxCapacity: 20,
    address: {
      line1: '33 Media Hub, Sector 3',
      area: 'Uttara',
      city: 'Dhaka',
      country: 'BD'
    },
    imageUrls: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      '25ft Curved White Cyclorama',
      'DMX Controlled RGB Light Grid',
      'Overhead Cable Rigging',
      'High-Speed Wi-Fi 6',
      'Hair & Makeup Station with Ring Lights',
      'Rolling Equipment Carts',
      'Client Viewing Lounge with 65" Monitor'
    ],
    overview: 'High-ceiling production space equipped with pre-hung LED motorized sky-panels and full DMX automation. Designed for commercial product launches, music video shoots, and virtual backdrop integration.',
    timezone: 'Asia/Dhaka',
    operatingHours: {
      monday: [{ start: '08:00', end: '22:00' }],
      tuesday: [{ start: '08:00', end: '22:00' }],
      wednesday: [{ start: '08:00', end: '22:00' }],
      thursday: [{ start: '08:00', end: '22:00' }],
      friday: [{ start: '08:00', end: '22:00' }],
      saturday: [{ start: '09:00', end: '22:00' }],
      sunday: [{ start: '09:00', end: '20:00' }]
    },
    unavailablePeriods: [],
    availabilityVersion: 1,
    rating: 4.97,
    reviewCount: 31,
    createdAt: new Date('2026-10-26T12:00:00Z'),
    updatedAt: new Date('2026-10-26T12:00:00Z')
  },
  {
    _id: new ObjectId(),
    ownerId: 'demo_host_mahfuz',
    ownerEmail: 'mahfuzhasan2700@gmail.com',
    ownerName: 'Mahfuz Hasan',
    ownerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    title: 'Monochrome Loft with Raw Brick & Skylights',
    category: 'photo-studio',
    hourlyRateCents: 5000,
    securityDepositCents: 4000,
    currency: 'USD',
    maxCapacity: 10,
    address: {
      line1: '16 Artisan Alley, Gulshan 1',
      area: 'Gulshan',
      city: 'Dhaka',
      country: 'BD'
    },
    imageUrls: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      'Raw Exposed Brick Accent Walls',
      'Distressed Oak Hardwood Floors',
      'South-Facing Factory Windows',
      'Aputure 300d II Lighting Kit',
      'C-Stands, Sandbags, and Apple Boxes',
      'Wardrobe Steamer & Changing Screen',
      'Nespresso Coffee Bar'
    ],
    overview: 'Industrial-chic natural light studio offering authentic architectural textures, weathered timber beams, and south-facing morning sunlight. A favorite among portrait photographers and lifestyle brand campaigns.',
    timezone: 'Asia/Dhaka',
    operatingHours: {
      monday: [{ start: '08:30', end: '19:30' }],
      tuesday: [{ start: '08:30', end: '19:30' }],
      wednesday: [{ start: '08:30', end: '19:30' }],
      thursday: [{ start: '08:30', end: '19:30' }],
      friday: [{ start: '08:30', end: '20:30' }],
      saturday: [{ start: '09:00', end: '20:30' }],
      sunday: [{ start: '09:00', end: '18:00' }]
    },
    unavailablePeriods: [],
    availabilityVersion: 1,
    rating: 4.91,
    reviewCount: 24,
    createdAt: new Date('2026-10-28T09:45:00Z'),
    updatedAt: new Date('2026-10-28T09:45:00Z')
  },
  {
    _id: new ObjectId(),
    ownerId: 'demo_host_marcus',
    ownerEmail: 'marcus.sound@studiospace.io',
    ownerName: 'Marcus Vance',
    ownerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    title: 'SubBass Mastering Suite & Vocal Chamber',
    category: 'music-suite',
    hourlyRateCents: 7500,
    securityDepositCents: 6000,
    currency: 'USD',
    maxCapacity: 4,
    address: {
      line1: '88 Soundwave Tower, Kemal Ataturk',
      area: 'Banani',
      city: 'Dhaka',
      country: 'BD'
    },
    imageUrls: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      'ATC SCM25A Pro Mastering Monitors',
      'Grace Design m905 Monitor Controller',
      'Manley Variable Mu Tube Compressor',
      'Schoeps Colette Stereo Microphone Pair',
      'Floating Room-Within-A-Room Acoustics',
      'Ergonomic Sterling Modular Desk',
      'High-Speed Audio Cloud Sync'
    ],
    overview: 'Acoustically certified stereo mastering suite and private tracking sanctuary calibrated for precise dynamic range handling and high-resolution master delivery.',
    timezone: 'Asia/Dhaka',
    operatingHours: {
      monday: [{ start: '10:00', end: '22:00' }],
      tuesday: [{ start: '10:00', end: '22:00' }],
      wednesday: [{ start: '10:00', end: '22:00' }],
      thursday: [{ start: '10:00', end: '22:00' }],
      friday: [{ start: '10:00', end: '23:00' }],
      saturday: [{ start: '10:00', end: '23:00' }],
      sunday: [{ start: '12:00', end: '20:00' }]
    },
    unavailablePeriods: [],
    availabilityVersion: 1,
    rating: 4.96,
    reviewCount: 17,
    createdAt: new Date('2026-10-30T15:00:00Z'),
    updatedAt: new Date('2026-10-30T15:00:00Z')
  }
];

async function runSeed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log(`Connected to MongoDB Atlas: ${dbName}`);
    const db = client.db(dbName);
    const studiosCollection = db.collection('studios');

    // Remove existing demo seed entries to avoid duplicates
    await studiosCollection.deleteMany({ ownerId: { $in: ['demo_host_mahfuz', 'demo_host_sarah', 'demo_host_alex', 'demo_host_marcus', 'demo_host_elena', 'demo_host_tariq'] } });
    console.log('Cleared existing demo studio data.');

    const result = await studiosCollection.insertMany(seedStudios as any);
    console.log(`Successfully seeded ${result.insertedCount} creative studios!`);

    await client.close();
    console.log('Database connection closed cleanly.');
  } catch (error) {
    console.error('Error seeding studios:', error);
    process.exit(1);
  }
}

runSeed();

