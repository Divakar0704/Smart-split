import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
import session from "express-session";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: false,
  })
);

// Dummy Database (Predefined Users)
const users = {
  "john": {
    username: "john",
    password: "john",  // Password is same as username for dummy users
    name: "John Doe",
    profession: "Software Engineer",
    income: "₹80,000",
    savingGoals: "Save ₹10,000 per month",
    expenseCategories: "Rent, Food, Transport, Entertainment",
    budgetHistory: "Last month savings: ₹8,000"
  },
  "divakar": {
    username: "divakar",
    password: "divakar",
    name: "divakar",
    profession: "Data Analyst",
    income: "₹90,000",
    savingGoals: "Save ₹12,000 per month",
    expenseCategories: "Rent, Food, Travel, Shopping",
    budgetHistory: "Last month savings: ₹10,000"
  },
  "varshitha": {
    username: "varshitha",
    password: "varshitha",
    name: "varshitha",
    profession: "UX Designer",
    income: "₹75,000",
    savingGoals: "Save ₹8,000 per month",
    expenseCategories: "Groceries, Dining, Travel",
    budgetHistory: "Last month savings: ₹6,500"
  }
};

// Home Page
app.get("/", (req, res) => {
  res.render("start.ejs");
});

// Login Page
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// Register Page
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// About Page
app.get("/about", (req, res) => {
  res.render("about.ejs");
});

// Planner Page
app.get("/planner", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("planner.ejs", { 
    needs: 50, wants: 30, savings: 20, user: req.session.user 
  });
});

// Handle Planner Data Submission
app.post("/planner", (req, res) => {
  const income = parseFloat(req.body.income);
  const needsRatio = parseFloat(req.body.needsRatio) / 100;
  const wantsRatio = parseFloat(req.body.wantsRatio) / 100;
  const savingsRatio = parseFloat(req.body.savingsRatio) / 100;

  if (needsRatio + wantsRatio + savingsRatio > 1) {
    return res.send("ENTER VALID RATIOS.");
  }

  if (!isNaN(income) && income > 0 && needsRatio + wantsRatio + savingsRatio === 1) {
    const needs = (income * needsRatio).toFixed(2);
    const wants = (income * wantsRatio).toFixed(2);
    const savings = (income * savingsRatio).toFixed(2);
    res.render("planner.ejs", { needs, wants, savings, user: req.session.user });
  } else {
    res.render("planner.ejs", { needs: 0, wants: 0, savings: 0, user: req.session.user });
  }
});

// Insights Page
app.get("/insights", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("insights.ejs", { user: req.session.user });
});

// Profile Page (Dynamic Data from Login)
app.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("profile.ejs", { user: req.session.user });
});

// Contact Page
app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

// Handle Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (users[username] && users[username].password === password) {
    req.session.user = users[username]; // Store user data in session
    res.redirect("/profile");
  } else {
    res.send("Invalid username or password. Please try again.");
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Error logging out");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Listening on port ${port}, http://localhost:3000/`);
});
