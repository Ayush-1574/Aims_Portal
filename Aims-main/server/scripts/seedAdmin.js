import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/Auth/User.js";

dotenv.config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    // Check if admin already exists
    const adminExists = await User.findOne({ email: "admin@aims.com" });
    if (adminExists) {
      console.log("ℹ Admin user already exists");
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: "admin@aims.com",
      role: "admin",
      isActive: true,
      data: {},
      roleHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("✓ Admin user created successfully!");
    console.log(`  Email: admin@aims.com`);
    console.log(`  Role: admin`);

  } catch (err) {
    console.error("✗ Error seeding admin:", err.message);
  } finally {
    await mongoose.connection.close();
    console.log("✓ Connection closed");
  }
}

seedAdmin();
