import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
import session from "express-session";
import mongoose from "mongoose";
import UserModel from "./models/UserModel.js";
import dotenv from "dotenv";

dotenv.config();

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const port = 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB Connection Error:", err));

// Set view engine and static files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware
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
app.get("/about", (req, res) => req.session.user ? res.render("about.ejs") : res.redirect("/login"));
app.get("/insights", (req, res) => req.session.user ? res.render("insights.ejs", { user: req.session.user }) : res.redirect("/login"));
app.get("/contact", (req, res) => res.render("contact.ejs"));
app.get("/profile", (req, res) => req.session.user ? res.render("profile.ejs", { user: req.session.user }) : res.redirect("/login"));

// Handle Login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await UserModel.findOne({ username });

    if (!existingUser || existingUser.password !== password) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    req.session.user = existingUser.username;
    res.redirect("/profile");
});

// Handle Registration
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (await UserModel.findOne({ username }) || await UserModel.findOne({ email })) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        await new UserModel({ username, email, password }).save();
        res.redirect("/login");
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Planner Page
app.get("/planner", async (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    const user = await UserModel.findOne({ username: req.session.user });
    if (!user) return res.status(404).json({ message: "User not found." });

    res.render("planner.ejs", {
        income: user.income || 0,
        needs: user.needs || 0,
        wants: user.wants || 0,
        savings: user.savings || 0,
        needsRatio: user.needsRatio || 0,
        wantsRatio: user.wantsRatio || 0,
        savingsRatio: user.savingsRatio || 0,
        user,
    });
});

app.post("/planner", async (req, res) => {
    const { income, needsRatio, wantsRatio, savingsRatio } = req.body;
    if (parseFloat(needsRatio) + parseFloat(wantsRatio) + parseFloat(savingsRatio) !== 100) {
        return res.status(400).send("Needs, Wants, and Savings ratios must add up to 100%.");
    }

    const username = req.session.user;
    const updatedUser = await UserModel.findOneAndUpdate(
        { username },
        {
            income: parseFloat(income),
            needsRatio: parseFloat(needsRatio),
            wantsRatio: parseFloat(wantsRatio),
            savingsRatio: parseFloat(savingsRatio),
            needs: (income * needsRatio / 100).toFixed(2),
            wants: (income * wantsRatio / 100).toFixed(2),
            savings: (income * savingsRatio / 100).toFixed(2),
        },
        { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.render("planner.ejs", {
        income: updatedUser.income,
        needsRatio: updatedUser.needsRatio,
        wantsRatio: updatedUser.wantsRatio,
        savingsRatio: updatedUser.savingsRatio,
        needs: updatedUser.needs,
        wants: updatedUser.wants,
        savings: updatedUser.savings,
        user: updatedUser,
    });
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.send("Error logging out");
        res.clearCookie("connect.sid");
        res.redirect("/");
    });
});

// Start Server
app.listen(port, () => console.log(`Listening on port ${port}, http://localhost:${port}/`));
