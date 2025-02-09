import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";

// Convert __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("start.ejs");
  });

  app.get("/login", (req, res) => {
    res.render("login.ejs");
  });

  app.get("/register", (req, res) => {
    res.render("register.ejs");
  });

  app.get("/about", (req, res) => {
    res.render("about.ejs");
  });

  app.get("/planner", (req, res) => {
    res.render("planner.ejs");
  });

  app.get("/insights", (req, res) => {
    res.render("insights.ejs");
  });

  app.get("/profile", (req, res) => {
    res.render("profile.ejs");
  });

  app.get("/contact", (req, res) => {
    res.render("contact.ejs");
  });

  app.listen(port, () => {
    console.log(`Listening on port ${port},http://localhost:3000/`);
  }); 
