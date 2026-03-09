require("dotenv").config();
const mongoose = require("mongoose");
const Property = require("../models/property");

const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URI;

if (!MONGO_URL) {
  console.error("Missing MONGO_URL or MONGO_URI in environment variables.");
  process.exit(1);
}

const properties = [
  {
    title: "Sea Breeze Villa",
    description: "Spacious sea-view villa with private patio and fast Wi-Fi.",
    location: "Goa",
    price: 6200,
    image: "https://picsum.photos/seed/stayease-goa-1/1200/800"
  },
  {
    title: "Himalayan Pine Retreat",
    description: "Cozy mountain stay with valley views, fireplace, and balcony.",
    location: "Manali",
    price: 4800,
    image: "https://picsum.photos/seed/stayease-manali-1/1200/800"
  },
  {
    title: "Lakeside Heritage Home",
    description: "Quiet lakeside home near old town cafes and local markets.",
    location: "Udaipur",
    price: 5300,
    image: "https://picsum.photos/seed/stayease-udaipur-1/1200/800"
  },
  {
    title: "City Pulse Apartment",
    description: "Modern apartment in the business district with metro access.",
    location: "Bengaluru",
    price: 4100,
    image: "https://picsum.photos/seed/stayease-bengaluru-1/1200/800"
  },
  {
    title: "Marina View Studio",
    description: "Compact studio with city skyline views and smart workspace.",
    location: "Mumbai",
    price: 5900,
    image: "https://picsum.photos/seed/stayease-mumbai-1/1200/800"
  },
  {
    title: "Royal Courtyard Stay",
    description: "Elegant courtyard property with traditional architecture.",
    location: "Jaipur",
    price: 4600,
    image: "https://picsum.photos/seed/stayease-jaipur-1/1200/800"
  },
  {
    title: "Backwater Breeze House",
    description: "Relaxing waterfront stay with private deck and breakfast.",
    location: "Kochi",
    price: 4400,
    image: "https://picsum.photos/seed/stayease-kochi-1/1200/800"
  },
  {
    title: "Tea Garden Escape",
    description: "Peaceful retreat surrounded by tea estates and misty views.",
    location: "Munnar",
    price: 5200,
    image: "https://picsum.photos/seed/stayease-munnar-1/1200/800"
  },
  {
    title: "Riverfront Loft",
    description: "Airy loft with river walk access and lively neighborhood vibe.",
    location: "Pune",
    price: 3900,
    image: "https://picsum.photos/seed/stayease-pune-1/1200/800"
  },
  {
    title: "Temple View Residency",
    description: "Comfortable stay close to major landmarks and food streets.",
    location: "Madurai",
    price: 3600,
    image: "https://picsum.photos/seed/stayease-madurai-1/1200/800"
  },
  {
    title: "Harbor Lights Inn",
    description: "Stylish rooms with harbor breeze and easy beach access.",
    location: "Chennai",
    price: 4300,
    image: "https://picsum.photos/seed/stayease-chennai-1/1200/800"
  },
  {
    title: "Snowline Chalet",
    description: "Warm chalet perfect for long stays with mountain sunrise views.",
    location: "Shimla",
    price: 5000,
    image: "https://picsum.photos/seed/stayease-shimla-1/1200/800"
  },
  {
    title: "Sunset Cliff Cottage",
    description: "Cliffside cottage with panoramic sunset deck and garden seating.",
    location: "Varkala",
    price: 5500,
    image: "https://picsum.photos/seed/stayease-varkala-1/1200/800"
  },
  {
    title: "Old Port Residence",
    description: "Historic-style stay with modern interiors near the promenade.",
    location: "Pondicherry",
    price: 4700,
    image: "https://picsum.photos/seed/stayease-pondy-1/1200/800"
  },
  {
    title: "Forest Mist Cabin",
    description: "Private cabin tucked in greenery with quiet trails nearby.",
    location: "Coorg",
    price: 5100,
    image: "https://picsum.photos/seed/stayease-coorg-1/1200/800"
  },
  {
    title: "Skyline Business Suite",
    description: "Executive suite with premium comfort and quick airport reach.",
    location: "Hyderabad",
    price: 4500,
    image: "https://picsum.photos/seed/stayease-hyd-1/1200/800"
  },
  {
    title: "Golden Dunes Retreat",
    description: "Desert-inspired stay with spacious rooms and evening rooftop views.",
    location: "Jaisalmer",
    price: 5400,
    image: "https://picsum.photos/seed/stayease-jaisalmer-1/1200/800"
  },
  {
    title: "Island Palm Hideaway",
    description: "Tropical comfort stay with airy interiors and local tours support.",
    location: "Andaman",
    price: 6800,
    image: "https://picsum.photos/seed/stayease-andaman-1/1200/800"
  }
];

async function seedProperties() {
  try {
    await mongoose.connect(MONGO_URL);

    const operations = properties.map((property) => ({
      updateOne: {
        filter: { title: property.title, location: property.location },
        update: { $set: property },
        upsert: true
      }
    }));

    const result = await Property.bulkWrite(operations, { ordered: false });

    const inserted = result.upsertedCount || 0;
    const modified = result.modifiedCount || 0;

    console.log(`Seed completed. Inserted: ${inserted}, Updated: ${modified}`);
  } catch (error) {
    console.error("Failed to seed properties:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seedProperties();
