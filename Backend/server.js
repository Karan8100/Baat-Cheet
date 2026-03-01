import express from "express"
import cors from "cors"
import authRouter from "./routes/auth.routes.js";
import { connectDB } from "./lib/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import messageRouter from "./routes/message.routes.js";
import { app,server,io } from "./lib/socket.js";
dotenv.config(); // Ye line process.env ko populate karti hai

import path from "path";

const __dirname = path.resolve();



const port = process.env.PORT;


//middlewares
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// Dynamic CORS configuration for production
// const getAllowedOrigins = () => {
//   const nodeEnv = process.env.NODE_ENV || "development";
  
//   if (nodeEnv === "production") {
//     // For production, use CLIENT_URL from environment
//     if (process.env.CLIENT_URL) {
//       return process.env.CLIENT_URL.split(",").map(url => url.trim());
//     }
//   }
  
//   // For development, allow localhost
//   return ["http://localhost:5173", "http://localhost:3000"];
// };

app.use(cors({
    origin: process.env.ClientUrl,
    credentials: true,
}));


app.use("/api/auth",authRouter);
app.use("/api/messages",messageRouter);






server.listen(port,async ()=>{
    console.log(`Server listening at http://localhost:${port}`)
    await connectDB()
});

