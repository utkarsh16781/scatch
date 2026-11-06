const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const path = require("path");
const db = require("./config/mongoose-connection");

const ownerRouter = require("./routes/ownersrouters");
const userRouter = require("./routes/usersrouter");
const productRouter = require("./routes/productsrouter");
require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

// Basic routes
app.get("/users", (req, res) => {
    res.send("Welcome to Users Page");
});

app.get("/owners", (req, res) => {
    res.send("Welcome to Owners Page");
});

app.get("/products", (req, res) => {
    res.send("Welcome to Products Page");
});

// Router connections
app.use("/owners", ownerRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});