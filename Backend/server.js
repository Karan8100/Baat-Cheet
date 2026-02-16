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
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}));


app.use("/api/auth",authRouter);
app.use("/api/messages",messageRouter);





if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"));
  });
}

server.listen(port,async ()=>{
    console.log(`Server listening at http://localhost:${port}`)
    await connectDB()
});

