const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load models
const Event = require('./models/Event');
const Venue = require('./models/Venue');
const User = require('./models/User');

dotenv.config();


mongoose.connect(process.env.MONGO_URI);

const venues = [
  {
    name: 'Grand Conference Center',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    capacity: 1000,
    amenities: ['Parking', 'WiFi', 'Catering'],
    description: 'A spacious venue perfect for large conferences and exhibitions'
  },
  {
    name: 'Tech Hub',
    address: '456 Innovation Ave',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    capacity: 500,
    amenities: ['AV Equipment', 'WiFi', 'Breakout Rooms'],
    description: 'Modern venue with cutting-edge technology for tech events'
  },
  {
    name: 'Cultural Center',
    address: '789 Arts Blvd',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    capacity: 750,
    amenities: ['Stage', 'Sound System', 'Exhibition Space'],
    description: 'Beautiful venue for cultural events and performances'
  }
];

// Sample admin user
const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'password123',
  role: 'admin'
};

// Sample events data with ticket types
const createEvents = (venueIds, adminId) => [
  {
    title: 'Web Development Conference 2025',
    description: 'Join us for the biggest web development conference of the year featuring talks on the latest frameworks, tools, and best practices.',
    category: 'Conference',
    address: '123 Main St, New York, NY, USA',
    city: 'New York',
    startDate: new Date('2025-06-15T09:00:00'),
    endDate: new Date('2025-06-17T18:00:00'),
    ticketTypes: [
      {
        name: 'General Admission',
        price: 199.99,
        quantity: 150,
        description: 'Access to all conference talks and workshops'
      },
      {
        name: 'VIP',
        price: 399.99,
        quantity: 50,
        description: 'Premium seating, exclusive networking sessions, and conference swag'
      }
    ],
    venue: venueIds[0],
    organizer: adminId,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    isFeatured: true,
    location: 'New York, NY',
    speakers: []
  },
  {
    title: 'Music Festival 2025',
    description: 'A three-day music festival featuring top artists from around the world. Experience amazing performances across multiple stages.',
    category: 'Concert',
    address: '456 Innovation Ave, San Francisco, CA, USA',
    city: 'San Francisco',
    startDate: new Date('2025-07-20T14:00:00'),
    endDate: new Date('2025-07-22T23:00:00'),
    ticketTypes: [
      {
        name: 'Day Pass',
        price: 79.99,
        quantity: 500,
        description: 'Single day access to all stages'
      },
      {
        name: 'Weekend Pass',
        price: 199.99,
        quantity: 300,
        description: 'Full weekend access to all stages and camping area'
      }
    ],
    venue: venueIds[1],
    organizer: adminId,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
    isFeatured: true,
    location: 'San Francisco, CA',
    speakers: []
  },
  {
    title: 'Business Leadership Summit',
    description: 'Connect with industry leaders and discover the latest strategies for business growth and leadership development.',
    category: 'Seminar',
    address: '789 Arts Blvd, Chicago, IL, USA',
    city: 'Chicago',
    startDate: new Date('2025-08-10T08:30:00'),
    endDate: new Date('2025-08-12T17:00:00'),
    ticketTypes: [
      {
        name: 'Standard',
        price: 249.99,
        quantity: 200,
        description: 'Access to all summit sessions and networking events'
      },
      {
        name: 'Executive',
        price: 499.99,
        quantity: 75,
        description: 'Premium access with exclusive roundtable discussions and 1:1 mentoring'
      }
    ],
    venue: venueIds[2],
    organizer: adminId,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
    isFeatured: false,
    location: 'Chicago, IL',
    speakers: []
  },
  {
    title: 'Fitness Expo 2025',
    description: 'The ultimate fitness experience with workshops, demos, and competitions for fitness enthusiasts of all levels.',
    category: 'Sports',
    address: '123 Main St, New York, NY, USA',
    city: 'New York',
    startDate: new Date('2025-09-05T10:00:00'),
    endDate: new Date('2025-09-07T18:00:00'),
    ticketTypes: [
      {
        name: 'Basic',
        price: 49.99,
        quantity: 400,
        description: 'General admission to expo floor and demos'
      },
      {
        name: 'Premium',
        price: 129.99,
        quantity: 150,
        description: 'Includes workshops, goodie bag, and competition entry'
      }
    ],
    venue: venueIds[0],
    organizer: adminId,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
    isFeatured: true,
    location: 'New York, NY',
    speakers: []
  },
  {
    title: 'AI and Machine Learning Conference',
    description: 'Explore the cutting edge of artificial intelligence and machine learning with talks from leading researchers and practitioners.',
    category: 'Conference',
    address: '456 Innovation Ave, San Francisco, CA, USA',
    city: 'San Francisco',
    startDate: new Date('2025-10-15T09:00:00'),
    endDate: new Date('2025-10-17T17:30:00'),
    ticketTypes: [
      {
        name: 'Regular',
        price: 189.99,
        quantity: 250,
        description: 'Access to all conference sessions and materials'
      },
      {
        name: 'Premium',
        price: 349.99,
        quantity: 100,
        description: 'Includes hands-on workshops and exclusive networking dinner'
      }
    ],
    venue: venueIds[1],
    organizer: adminId,
    image: 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9',
    isFeatured: false,
    location: 'San Francisco, CA',
    speakers: []
  }
];

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await Event.deleteMany();
    await Venue.deleteMany();
    
  
    let admin = await User.findOne({ email: adminUser.email });
    if (!admin) {
      admin = await User.create(adminUser);
      console.log('Admin user created'.green.inverse);
    }
    
    
    const createdVenues = await Venue.insertMany(venues);
    console.log('Venues imported'.green.inverse);
    
    
    const venueIds = createdVenues.map(venue => venue._id);
    
    const eventsToCreate = createEvents(venueIds, admin._id);
    await Event.insertMany(eventsToCreate);
    console.log('Events imported'.green.inverse);
    
    console.log('Data Import Complete!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};


const deleteData = async () => {
  try {
    await Event.deleteMany();
    await Venue.deleteMany();
    
    console.log('Data Destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};


if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use -i to import data or -d to delete data'.yellow);
  process.exit();
}
