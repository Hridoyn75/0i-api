import express from 'express';
import shortid from 'shortid';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.json("Server is live!");
})
// Create a route to shorten a URL using a GET request and query parameters
app.get('/shorten', (req, res) => {
  const longUrl = req.query.longUrl;

  if(longUrl){
    const shortUrl = shortid.generate();

  const link = { longUrl, "shortUrl": "https://0i.vercel.app/" + shortUrl };

  const q= `INSERT INTO links (longUrl,shortUrl) VALUES (?,?)`;

  db.query(q, [longUrl,shortUrl],(error, data)=>{
    if(error) return res.status(500).json("Database error")
    res.json(link);
  })
  }else{
 res.json("Please send url with longUrl query");
  }
});

// Redirect to the original URL when accessing the short URL
app.get('/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;

  const q = `SELECT longUrl FROM links WHERE shortUrl = ?`

  db.query(q, [shortUrl], (error, data)=>{
    if(error) return res.status(500).json("Database error");

    if(data.length === 0) return res.status(404).send("Invaild url")
    res.redirect(data[0].longUrl);
  })
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
