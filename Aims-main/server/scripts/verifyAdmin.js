import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/Auth/User.js";

dotenv.config();

async function verifyAdminSetup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB\n");

    // Check admin exists
    const admin = await User.findOne({ email: "ayushsonika11@gmail.com" });
    
    if (!admin) {
      console.log("❌ ADMIN NOT FOUND!");
      console.log("\n📋 ACTION REQUIRED:");
      console.log("1. Go to MongoDB Atlas");
      console.log("2. Collections → users");
      console.log("3. Insert this document:");
      console.log(JSON.stringify({
        name: "Admin",
        email: "ayushsonika11@gmail.com",
        role: "admin",
        isActive: true,
        data: {},
        roleHistory: []
      }, null, 2));
      
      await mongoose.connection.close();
      return;
    }

    console.log("✓ Admin user found!");
    console.log(`  Name: ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Active: ${admin.isActive}\n`);

    // List all users by role
    const stats = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    console.log("📊 User Statistics:");
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

    console.log("\n✅ Setup looks good! Ready to login as admin.");
    console.log("\n🔐 Login Instructions:");
    console.log("1. Go to http://localhost:5173");
    console.log("2. Email: ayushsonika11@gmail.com");
    console.log("3. Send OTP → Check Gmail → Enter OTP");
    console.log("4. You'll be redirected to /admin/dashboard");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.connection.close();
  }
}

verifyAdminSetup();
