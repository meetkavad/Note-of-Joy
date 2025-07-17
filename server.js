const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/excitement-calendar";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Event Schema
const eventSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true, // One document per date
    },
    excitingToday: [
      {
        id: String,
        text: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    futureExpectations: [
      {
        id: String,
        text: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.authenticated) {
    next();
  } else {
    res.status(401).json({ error: "Authentication required" });
  }
};

// Authentication routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { password } = req.body;
    const correctPassword = process.env.AUTH_PASSWORD || "mySecurePassword123";

    if (password === correctPassword) {
      req.session.authenticated = true;
      res.json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

app.get("/api/auth/check", (req, res) => {
  res.json({ authenticated: !!req.session.authenticated });
});

// API Routes

// Get events for a specific date
app.get("/api/events/:date", requireAuth, async (req, res) => {
  try {
    const { date } = req.params;
    const event = await Event.findOne({ date });

    if (!event) {
      return res.json({
        date,
        excitingToday: [],
        futureExpectations: [],
      });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add or update events for a specific date
app.post("/api/events/:date", requireAuth, async (req, res) => {
  try {
    const { date } = req.params;
    const { excitingToday, futureExpectations } = req.body;

    // Check if date is not in the past (for adding new items)
    const selectedDateStr = date; // e.g., "2025-07-16"
    const today = new Date();
    const todayStr =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    console.log(
      "Selected date string:",
      selectedDateStr,
      "Today string:",
      todayStr
    );

    if (selectedDateStr < todayStr) {
      return res.status(400).json({ error: "Cannot add events to past dates" });
    }

    let event = await Event.findOne({ date });

    if (!event) {
      event = new Event({
        date,
        excitingToday: excitingToday || [],
        futureExpectations: futureExpectations || [],
      });
    } else {
      if (excitingToday) event.excitingToday = excitingToday;
      if (futureExpectations) event.futureExpectations = futureExpectations;
    }

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a single item to exciting today
app.post("/api/events/:date/exciting-today", requireAuth, async (req, res) => {
  try {
    const { date } = req.params;
    const { text } = req.body;

    console.log("Adding exciting today event:", { date, text });

    // Parse dates more reliably - use date strings for comparison
    const selectedDateStr = date; // e.g., "2025-07-16"
    const today = new Date();
    const todayStr =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    console.log("Selected date string:", selectedDateStr);
    console.log("Today string:", todayStr);
    console.log("Comparison:", selectedDateStr < todayStr);

    if (selectedDateStr < todayStr) {
      console.log("Date is in the past:", date);
      return res.status(400).json({ error: "Cannot add events to past dates" });
    }

    let event = await Event.findOne({ date });

    if (!event) {
      event = new Event({
        date,
        excitingToday: [],
        futureExpectations: [],
      });
    }

    const newItem = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
    };

    event.excitingToday.push(newItem);
    await event.save();

    console.log("Event saved successfully");
    res.json(event);
  } catch (error) {
    console.error("Error adding exciting today:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add a single item to future expectations
app.post(
  "/api/events/:date/future-expectations",
  requireAuth,
  async (req, res) => {
    try {
      const { date } = req.params;
      const { text } = req.body;

      console.log("Adding future expectation:", { date, text });

      // Parse dates more reliably - use date strings for comparison
      const selectedDateStr = date; // e.g., "2025-07-16"
      const today = new Date();
      const todayStr =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");

      console.log("Selected date string:", selectedDateStr);
      console.log("Today string:", todayStr);
      console.log("Comparison:", selectedDateStr < todayStr);

      if (selectedDateStr < todayStr) {
        console.log("Date is in the past:", date);
        return res
          .status(400)
          .json({ error: "Cannot add events to past dates" });
      }

      let event = await Event.findOne({ date });

      if (!event) {
        event = new Event({
          date,
          excitingToday: [],
          futureExpectations: [],
        });
      }

      const newItem = {
        id: Date.now().toString(),
        text,
        timestamp: new Date(),
      };

      event.futureExpectations.push(newItem);
      await event.save();

      console.log("Event saved successfully");
      res.json(event);
    } catch (error) {
      console.error("Error adding future expectation:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete an item from exciting today
app.delete(
  "/api/events/:date/exciting-today/:itemId",
  requireAuth,
  async (req, res) => {
    try {
      const { date, itemId } = req.params;

      const event = await Event.findOne({ date });
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      event.excitingToday = event.excitingToday.filter(
        (item) => item.id !== itemId
      );
      await event.save();

      res.json(event);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete an item from future expectations
app.delete(
  "/api/events/:date/future-expectations/:itemId",
  requireAuth,
  async (req, res) => {
    try {
      const { date, itemId } = req.params;

      const event = await Event.findOne({ date });
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      event.futureExpectations = event.futureExpectations.filter(
        (item) => item.id !== itemId
      );
      await event.save();

      res.json(event);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Serve the frontend
app.get("/", (req, res) => {
  if (req.session.authenticated) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    res.redirect("/login.html");
  }
});

// Serve login page
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
