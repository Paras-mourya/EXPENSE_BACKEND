import dotenv from "dotenv";
import mongoose from "mongoose";
import Bill from "./models/Bill.js";


dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ MongoDB Connected");

try {
  await Bill.deleteMany();
  

  await Bill.insertMany([
    {
      vendor: "Netflix",
      plan: "Premium",
      dueDate: new Date("2025-09-01"),
      amount: 19.99,
      logoUrl: "/logos/netflix.png",
      lastChargeDate: new Date("2025-08-01"),
    },
    {
      vendor: "Spotify",
      plan: "Individual",
      dueDate: new Date("2025-09-05"),
      amount: 9.99,
      logoUrl: "/logos/spotify.png",
      lastChargeDate: new Date("2025-08-05"),
    },
    {
      vendor: "YouTube Premium",
      plan: "Family",
      dueDate: new Date("2025-09-10"),
      amount: 11.99,
      logoUrl: "/logos/youtube.png",
      lastChargeDate: new Date("2025-08-10"),
    },
    {
      vendor: "Game Station",
      plan: "Friends",
      dueDate: new Date("2025-09-10"),
      amount: 11.99,
      logoUrl: "/logos/youtube.png",
      lastChargeDate: new Date("2025-08-10"),
    },
    {
      vendor: "SocialMedia",
      plan: "Family",
      dueDate: new Date("2025-09-10"),
      amount: 11.99,
      logoUrl: "/logos/youtube.png",
      lastChargeDate: new Date("2025-08-10"),
    },
    {
      vendor: "WorldTour Premium",
      plan: "Family",
      dueDate: new Date("2025-09-10"),
      amount: 11.99,
      logoUrl: "/logos/youtube.png",
      lastChargeDate: new Date("2025-08-10"),
    },
    {
      vendor: "SkyDiving Course",
      plan: "Alone",
      dueDate: new Date("2025-09-10"),
      amount: 11.99,
      logoUrl: "/logos/youtube.png",
      lastChargeDate: new Date("2025-08-10"),
    },
  ]);

  



  console.log(" Bills Seeded Successfully!");
  process.exit();
} catch (err) {
  console.error(" Error Seeding Bills:", err);
  process.exit(1);
}
