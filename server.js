import express from "express";
import cors from "cors";
import morgan from "morgan";
import connect from "./config/Database.js";
import router from "./router/route.js";
import dotenv from "dotenv";

const app = express();
dotenv.config();

// middleware
app.use(express.json({ limit: "50mb" }));
app.use(morgan("tiny"));
app.use(cors({ credentials: true, origin: process.env.WEBSITE_URI }));
app.disable("x-powered-by"); //less hacker know about stack
// Http get request
app.get("/", (req, res) => {
  res.status(201).json("Home GET Request");
});

// api routes
app.use("/api", router);

// Start server
connect()
  .then(() => {
    try {
      app.listen(process.env.PORT, () =>
        console.log(`Server connected to http://localhost:${process.env.PORT}`)
      );
    } catch (err) {
      console.log("Cannot connect to the server");
    }
  })
  .catch((err) => {
    console.log("Invalid database connection...!");
  });
