const express = require('express');
const shortid = require('shortid');

const app = express();
const PORT = process.env.PORT || 5000;

const links = [];

app.use(express.json());

app.get('/', (req, res) => {
    res.json("Server is live!");
})
// Create a route to shorten a URL using a GET request and query parameters
app.get('/shorten', (req, res) => {
  const longUrl = req.query.longUrl;

  if(longUrl){
    const shortUrl = shortid.generate();

  const link = { longUrl,shortUrl };
  links.push(link);
  console.log(links)
  res.json({ longUrl, "shortUrl": "https://0i.vercel.app/" + shortUrl });
  }else{
 res.json("Please send url with longUrl query");
  }
});

// Redirect to the original URL when accessing the short URL
app.get('/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;
  const link = links.find((item) => item.shortUrl === shortUrl);

  console.log(links)
  if (link) {
    res.redirect(link.longUrl);
  } else {
    res.status(404).json({ error: 'Link not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
