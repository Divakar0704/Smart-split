import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import UserModel from "./models/UserModel.js";
import dotenv from "dotenv";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

//mongo session
const sessionStorage = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  dbName: "test",
  collection: "user",
  ttl: 14 * 24 * 60 * 60, // 14 days
  autoRemove: "interval",
  autoRemoveInterval: 60, // Removes expired sessions every 60 mins
});

app.use(
  session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: true, // Only save if the session is modified
    store: sessionStorage,
    cookie: {
      // secure: process.env.NODE_ENV === "production",
      // httpOnly: true,
      // sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// app.use(
//     session({
//       secret: "mySecretKey",
//       resave: false,
//       saveUninitialized: true,
//       cookie:{maxAge:10000000},

//     })
//   );

app.get("/check-session", (req, res) => {
  console.log("Session Data:", req.session);
  res.send(req.session);
});

// Home Page
app.get("/", (req, res) => {
  res.render("start.ejs");
});

// Login Page
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// Handle Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const existingUsername = await UserModel.findOne({ username } );

  if(!existingUsername||existingUsername.password!=password){
    
    return res.status(400).json({ message: 'Username or email does not match' });
  }
  req.session.user = existingUsername.username; // Store user data in session
  res.redirect("/profile");

});

// Register Page
app.get("/register", (req, res) => {
  res.render("register.ejs");

});




// Registration Route
app.post('/register', async (req, res) => {

  const { username, password,email } = req.body;
//   const username  = req.body.username;
//   const email = req.body.email;
// const password = req.body.password;
//   console.log(username);
  try {
    // Check if the user already exists
    const existingUsername = await UserModel.findOne({ username } );
    const existingEmail = await UserModel.findOne({ email } );
    if (existingUsername || existingEmail ) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }else{

      // Create a new user
    const newUser = new UserModel({ username, email, password });
    await newUser.save();
    
    res.redirect("/login");
    
    }    
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




// About Page
app.get("/about", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
    
  }
  res.render("about.ejs")

});



// Planner Page
app.get("/planner", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
    
  }

  const username = req.session.user;
  const user = await UserModel.findOne({ username });
  // console.log(JSON.stringify(user));
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

     const income= user.income || 0;
     const needsRatio= user.needsRatio|| 0;
     const wantsRatio= user.wantsRatio|| 0;
     const savingsRatio= user.savingsRatio|| 0;
     const needs= user.needs|| 0;
     const wants= user.wants|| 0;
     const savings= user.savings|| 0;

  res.render("planner.ejs", { 
    income,needs, wants, savings,needsRatio, wantsRatio, savingsRatio, user
  });
});


app.post("/planner", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
    
  }
  const username = req.session.user; // Ensure this is the correct way to access the username
  
  const income = parseFloat(req.body.income);
  const needsRatio = parseFloat(req.body.needsRatio);
  const wantsRatio = parseFloat(req.body.wantsRatio);
  const savingsRatio = parseFloat(req.body.savingsRatio);

  // Validate ratios
  if (needsRatio + wantsRatio + savingsRatio !== 100) {
    return res.status(400).send("Needs, Wants, and Savings ratios must add up to 100%.");
  }

  // Calculate needs, wants, and savings
  const needs = (income * needsRatio / 100).toFixed(2);
  const wants = (income * wantsRatio / 100).toFixed(2);
  const savings = (income * savingsRatio / 100).toFixed(2);

  try {
    // Update the user's data in the database
    const updatedUser = await UserModel.findOneAndUpdate(
      { username },
      { income, needsRatio, wantsRatio, savingsRatio, needs, wants, savings },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Render the planner page with updated data
    return res.render("planner.ejs", {
      income: updatedUser.income,
      needsRatio: updatedUser.needsRatio,
      wantsRatio: updatedUser.wantsRatio,
      savingsRatio: updatedUser.savingsRatio,
      needs: updatedUser.needs,
      wants: updatedUser.wants,
      savings: updatedUser.savings,
      user: updatedUser // Pass the entire user object if needed
    });
  } catch (error) {
    console.error('Error during update:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});



// Insights Page
// app.get("/insights", async (req, res) => {
//   if (!req.session.user) {
//     return res.redirect("/login");
    
//   }
//   res.render("insights.ejs", { user: req.session.user });

// });

// Insights Page
app.get("/insights", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  
  const username = req.session.user;
  const user = await UserModel.findOne({ username });
  
  // If user exists, get their income and savings data
  const income = user ? user.income || 0 : 0;
  const savings = user ? user.savings || 0 : 0;
  
  res.render("insights.ejs", { 
    user, 
    income,
    savings
  });
});

// Profile Page (Dynamic Data from Login)
app.get("/profile", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
    
  }
  const username = req.session.user;
  const user = await UserModel.findOne({ username });

  res.render("profile.ejs", { user });

});

//edit-profile page
app.get  ("/edit-profile",async (req,res)=>{
  if (!req.session.user) {
    return res.redirect("/login");
    
  }
  const username = req.session.user;
  const user = await UserModel.findOne({ username });

  res.render("edit-profile.ejs",{user});
});

app.post("/edit-profile", async (req, res) => {
  const username = req.session.user;

  const { email, categories, income, savingsRatio, wantsRatio, needsRatio, profession } = req.body;

  try {
    // Update the user's data in the database
    const updatedUser = await UserModel.findOneAndUpdate(
      { username },
      {username, email, categories, income, needsRatio, wantsRatio, savingsRatio, profession },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Redirect to profile page after successful update
    return res.redirect("/profile");
  } catch (error) {
    console.error("Error during update:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});



// Contact Page
app.get("/contact", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
    
  }
  res.render("contact.ejs");
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