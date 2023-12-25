import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { nanoid } from "nanoid";

import db from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://hridoylink.vercel.app",
  "https://hridoylinks.vercel.app",
  "http://localhost:3000",
];

const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.redirect(process.env.FRONTEND_URL);
});

let length = 2;

const GenerateShorten = (longUrl, res) => {
  const shortUrl = nanoid(length);
  const TrackingId = nanoid(15);

  const q = ` SELECT * FROM links WHERE shortUrl = ?`;
  db.query(q, [shortUrl], (error, data) => {
    if (error) return res.status(500).json("Database error");
    if (data.length !== 0) {
      length += 1;
      GenerateShorten(longUrl, res);
      return;
    }
    const link = {
      longUrl,
      shortUrl: process.env.BACKEND_URL + "/" + shortUrl,
      tracking_id: TrackingId,
    };

    const q = `INSERT INTO links (longUrl,shortUrl, tracking_id) VALUES (?,?,?)`;

    db.query(q, [longUrl, shortUrl, TrackingId], (error, data) => {
      if (error) return res.status(500).json("Database error");
      res.json(link);
    });
  });
};

// Create a route to shorten a URL using a GET request and query parameters
app.get("/shorten", (req, res) => {
  const longUrl = req.query.longUrl;

  if (longUrl) {
    GenerateShorten(longUrl, res);
  } else {
    res.json("Please send url with longUrl query");
  }
});

// Redirect to the original URL when accessing the short URL
app.get("/:shortUrl", (req, res) => {
  const { shortUrl } = req.params;

  const qSelect = `SELECT longUrl FROM links WHERE shortUrl = ?`;

  db.query(qSelect, [shortUrl], (error, data) => {
    if (error) return res.status(500).json("Database error");

    if (data.length !== 0) {
      const qUpdate = "UPDATE links SET count = count + 1 WHERE shortUrl = ?";
      db.query(qUpdate, [shortUrl], (error, result) => {
        if (error) return res.status(500).json("Database error");
        res.redirect(data[0].longUrl);
      });
      return;
    }
    res.redirect(process.env.FRONTEND_URL);
  });
});

app.get('/track/:id', (req, res)=>{
  const trackingId = req.params.id;

  const q = `SELECT * from links WHERE tracking_id = ?`
  db.query(q, [trackingId], (error, data)=>{
    if (error) return res.status(500).json("Database error");
    res.json(data[0])
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
