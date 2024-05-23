require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const url = require('url');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Middleware pour parser le corps des requêtes POST
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let urlDatabase = []; // Pour stocker les URLs

// Route pour raccourcir une URL
app.post('/api/shorturl', (req, res) => {
    const originalUrl = req.body.url;

    // Valider l'URL
    const parsedUrl = url.parse(originalUrl);
    if (!parsedUrl.protocol || !parsedUrl.hostname) {
        return res.json({ error: 'invalid url' });
    }

    // Vérifier l'URL avec DNS lookup
    dns.lookup(parsedUrl.hostname, (err) => {
        if (err) {
            return res.json({ error: 'invalid url' });
        }

        const shortUrl = urlDatabase.length + 1;
        urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });

        res.json({ original_url: originalUrl, short_url: shortUrl });
    });
});

// Route pour rediriger vers l'URL originale
app.get('/api/shorturl/:short_url', (req, res) => {
    const shortUrl = parseInt(req.params.short_url);
    const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);

    if (urlEntry) {
        res.redirect(urlEntry.original_url);
    } else {
        res.json({ error: 'No short URL found for the given input' });
    }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
