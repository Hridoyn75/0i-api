import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { nanoid } from "nanoid";

import db from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.redirect("https://linkspro.vercel.app");
});

let length = 2;

const GenerateShorten = (longUrl, res) => {

  const shortUrl = nanoid(length);

  const q = ` SELECT * FROM links WHERE shortUrl = ?`;
  db.query(q, [shortUrl], (error, data) => {
    if (error) return res.status(500).json("Database error");
    if(data.length !== 0) {

      length += 1;
      GenerateShorten(longUrl, res)
      return
    }
    const link = { longUrl, "shortUrl": "https://0i.vercel.app/" + shortUrl };

    const q= `INSERT INTO links (longUrl,shortUrl) VALUES (?,?)`;

    db.query(q, [longUrl,shortUrl],(error, data)=>{
      if(error) return res.status(500).json("Database error")
      res.json(link);
    })
  });
};


// Create a route to shorten a URL using a GET request and query parameters
app.get("/shorten", (req, res) => {
  const longUrl = req.query.longUrl;

  if (longUrl) {

    GenerateShorten(longUrl, res)

    // const link = { longUrl, "shortUrl": "https://0i.vercel.app/" + shortUrl };

    // const q= `INSERT INTO links (longUrl,shortUrl) VALUES (?,?)`;

    // db.query(q, [longUrl,shortUrl],(error, data)=>{
    //   if(error) return res.status(500).json("Database error")
    //   res.json(link);
    // })
  } else {
    res.json("Please send url with longUrl query");
  }
});

// Redirect to the original URL when accessing the short URL
app.get("/:shortUrl", (req, res) => {
  const { shortUrl } = req.params;

  const q = `SELECT longUrl FROM links WHERE shortUrl = ?`;

  db.query(q, [shortUrl], (error, data) => {
    if (error) return res.status(500).json("Database error");

    if (data.length === 0) return res.redirect("https://linkspro.vercel.app");
    res.redirect(data[0].longUrl);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
