import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
import session from "express-session";
import mongoose from "mongoose";
import UserModel from "./models/UserModel.js";
import dotenv from "dotenv";

dotenv.config();

// Setup file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB Connection Error:", err));

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: false,
  })
);

// Routes
app.get("/", (req, res) => res.render("start.ejs"));

app.get("/login", (req, res) => res.render("login.ejs"));

app.get("/register", (req, res) => res.render("register.ejs"));

app.get("/about", (req, res) => res.render("about.ejs"));

app.get("/insights", (req, res) => res.render("insights.ejs", { user: req.session.user }));

app.get("/profile", (req, res) => res.render("profile.ejs", { user: req.session.user }));

app.get("/contact", (req, res) => res.render("contact.ejs"));

// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await UserModel.findOne({ username });
  if (!user || user.password !== password) {
    return res.status(400).json({ message: "Invalid username or password" });
  }
  req.session.user = user.username;
  res.redirect("/profile");
});

// Registration Route
app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const existingUser = await UserModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists" });
    }
    await new UserModel({ username, email, password }).save();
    res.redirect("/login");
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Planner Route
app.get("/planner", async (req, res) => {
  const user = await UserModel.findOne({ username: req.session.user });
  if (!user) return res.status(404).json({ message: "User not found." });
  res.render("planner.ejs", { ...user.toObject() });
});

app.post("/planner", authMiddleware, async (req, res) => {
  const { income, needsRatio, wantsRatio, savingsRatio } = req.body;
  if (+needsRatio + +wantsRatio + +savingsRatio !== 100) {
    return res.status(400).send("Needs, Wants, and Savings ratios must sum to 100%.");
  }
  const updatedUser = await UserModel.findOneAndUpdate(
    { username: req.session.user },
    {
      income,
      needsRatio,
      wantsRatio,
      savingsRatio,
      needs: ((income * needsRatio) / 100).toFixed(2),
      wants: ((income * wantsRatio) / 100).toFixed(2),
      savings: ((income * savingsRatio) / 100).toFixed(2),
    },
    { new: true }
  );
  res.render("planner.ejs", { ...updatedUser.toObject() });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.send("Error logging out");
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

// Authentication Middleware
function authMiddleware(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}


// Start Server
app.listen(port, () => console.log(`Server running at http://localhost:${port}/`));
