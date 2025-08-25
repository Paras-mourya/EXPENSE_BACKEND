import dotenv from "dotenv";
import mongoose from "mongoose";
import Goal from "./models/Goal.js";


dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ MongoDB Connected");

try {

  await Goal.deleteMany();
  



  await Goal.insertMany([
    {
      title: "Buy a Car",
      targetAmount: 1000000,
      currentAmount: 250000,
      deadline: new Date("2026-12-31"),
    },
    {
      title: "Vacation",
      targetAmount: 50000,
      currentAmount: 15000,
      deadline: new Date("2025-06-30"),
    },
    {
      title:"Summer",
      targetAmount:100000,
      currentAmount:24000,
      deadline:new Date("2024-12-14"),
    },
    {
      title:"World Tour",
      targetAmount:200000,
      currentAmount:12000,
      deadline:new Date("2025-12-12"),
    },
    {
      title:"Car Racing",
      targetAmount:1400000,
      currentAmount:240000,
      deadline:new Date("2024-12-14"),
    },
    {
      title:"Sky Diving",
      targetAmount:800000,
      currentAmount:28000,
      deadline:new Date("2024-12-14"),
    },
    ,{
      title:"Bunjee Jumping",
      targetAmount:200000,
      currentAmount:80000,
      deadline:new Date("2024-12-14"),
    }
  ]);



  console.log(" Goals Seeded Successfully!");
  process.exit();
} catch (err) {
  console.error(" Error Seeding Goals:", err);
  process.exit(1);
}
