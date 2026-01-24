import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoute.js";
import courseRoutes from "./src/routes/courseRoute.js";
import enrollmentRoutes from "./src/routes/enrollmentRoute.js";
import adminRoutes from "./src/routes/adminRoute.js";
import cookieParser from "cookie-parser";

console.log("BACKEND FILE RUNNING");

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,   // ✅ REQUIRED for cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
  console.log("HIT:", req.method, req.url);
  next();
});

app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);
app.use("/enrollment", enrollmentRoutes);
app.use("/admin", adminRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
