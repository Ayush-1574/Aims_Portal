// import express from "express"
// import mongoose from "mongoose"
// import cookieParser from "cookie-parser"
// import cors from "cors"
// import dotenv from "dotenv";
// dotenv.config();


// const app = express()



// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log(err));



// const PORT = process.env.PORT || 5000;

// app.use(
//     cors({
//         origin : 'http://localhost:5177',
//         methods : ['GET' , 'POST' , 'DELETE' , 'PUT'],
//         allowedHeaders : [
//             'Content-Type',
//             'Authorization',
//             'Cache-Control',
//             'Expires',
//             'Pragma'
//         ],
//         credentials : true
//     })
// )

// app.use(cookieParser())
// // app.use(express.json())
// // app.use("/api/v1/auth" , authRouter)
// // app.use("/api/v1/admin/products" , adminProductRouter)
// // app.use("/api/v1/shop/products" ,shopProductRoute)
// // app.use("/api/v1/shop/cart" ,cartProductRoute)
// // app.use("/api/v1/shop/address" ,shopAddressRoute)

// app.listen(PORT , () => console.log("server is running on PORT" , PORT))



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

app.use(cors({
    origin: "http://localhost:5173",
    credentials: false,  // Don't need credentials since using Authorization header
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use((req, res, next) => {
  console.log("HIT:", req.method, req.url);
  next();
});
app.use(cookieParser());
app.use(express.json());
app.use("/courses", courseRoutes);
app.use("/enrollment", enrollmentRoutes);
app.use("/admin", adminRoutes);

app.use("/auth", authRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
