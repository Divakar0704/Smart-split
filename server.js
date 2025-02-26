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
    res.render("planner.ejs", { needs: 0, wants: 0, savings: 0 });
});


app.post("/planner", (req, res) => {
  const income = parseFloat(req.body.income);
  const needsRatio = parseFloat(req.body.needsRatio) / 100;
  const wantsRatio = parseFloat(req.body.wantsRatio) / 100;
  const savingsRatio = parseFloat(req.body.savingsRatio) / 100;

  if (!isNaN(income) && income > 0 && needsRatio + wantsRatio + savingsRatio === 1) {
      const needs = (income * needsRatio).toFixed(2);
      const wants = (income * wantsRatio).toFixed(2);
      const savings = (income * savingsRatio).toFixed(2);

      res.render("planner.ejs", { needs, wants, savings });
  } else {
      res.render("planner.ejs", { needs: 0, wants: 0, savings: 0 });
  }
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
