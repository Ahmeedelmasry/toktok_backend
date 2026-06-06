require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const os = require("os");
const http = require("http");

// Routes
const adminAuth = require("./routes/adminAuth");
const admins = require("./routes/admin");
const clients = require("./routes/client");
const drivers = require("./routes/driver");
const vehicles = require("./routes/vehicle");

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
app.use("/auth", adminAuth);
app.use("/admins", admins);
app.use("/clients", clients);
app.use("/drivers", drivers);
app.use("/vehicles", vehicles);

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
