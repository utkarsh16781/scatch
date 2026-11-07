require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
require("./config/mongoose-connection");

const indexRouter = require("./routes/index");
const ownerRouter = require("./routes/ownersrouters");
const userRouter = require("./routes/usersrouter");
const productRouter = require("./routes/productsrouter");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Values every view can use (navigation state and the ?error= / ?success= messages)
app.use((req, res, next) => {
  res.locals.loggedIn = Boolean(req.cookies.token);
  res.locals.ownerLoggedIn = Boolean(req.cookies.ownerToken);
  res.locals.error = req.query.error || null;
  res.locals.success = req.query.success || null;
  next();
});

app.use("/", indexRouter);
app.use("/owners", ownerRouter);
app.use("/users", userRouter);
app.use("/products", productRouter);

app.use((req, res) => {
  res.status(404).render("error", { title: "Not found", code: 404, message: "That page doesn't exist." });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error(err);
  res.status(500).render("error", { title: "Error", code: 500, message: "Something went wrong on our side. Try again." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
