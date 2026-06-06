require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const os = require("os");
const http = require("http");

// Routes
const adminAuth = require("../routes/dashboard/adminAuth");
const admins = require("../routes/dashboard/admin");
const clients = require("../routes/dashboard/client");
const appClients = require("../routes/application/client");
const drivers = require("../routes/dashboard/driver");
const vehicles = require("../routes/dashboard/vehicle");

// Set Headers
app.use((req, res, next) => {
  res
    .header("Access-Control-Allow-Origin", "*")
    .header("Access-Control-Allow-Methods", "GET, POST, HEAD, PUT, DELETE")
    .header(
      "Access-Control-Allow-Headers",
      "auth-token, Origin, X-Requested-With, Content-Type, Accept, Authorization, lang",
    )
    .header("Access-Control-Allow-Credentials", true);
  next();
});

//Config
app.use(bodyParser.json());

//Cookie Parser
app.use(cookieParser());

// Public Files
app.use(express.static("profile_images"));
app.use(express.static("vehicla_images"));

// Routes
// Dashboard
app.use("/dashboard/auth", adminAuth);
app.use("/dashboard/admins", admins);
app.use("/dashboard/clients", clients);
app.use("/dashboard/drivers", drivers);
app.use("/dashboard/vehicles", vehicles);

// Application
app.use("/user", appClients);

app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
});

const httpServer = http.createServer(app);

// httpServer.timeout = 0;

const PORT = process.env.PORT || 4000;

//Database Connection
mongoose
  .set("strictQuery", true)
  .connect(process.env.DB_URI)
  .then(() => {
    httpServer.listen(process.env.PORT, () => {
      console.log(`Listining at port ${process.env.PORT || 4000}`);
    });
  })
  .catch((err) => console.log(err));
