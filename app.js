const express = require('express');
const app = express();
const path = require('path');
const db = require('./db'); // Ensure db.js exports the correct object

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'ejs'));

app.get('/', (req, res) => {
    db.query(
        'SELECT id, name, author, SUBSTRING(body, 1, 100) AS snippet FROM articles ORDER BY id DESC LIMIT 10',
        (err, result) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Error fetching recent articles.');
            }
            res.render('index', { articles: result.rows });
        }
    );
});

app.get('/create-article', (req, res) => {
    res.render('create-article');
});

app.post('/create-article', (req, res) => {
    const { title, articleText, authors } = req.body;

    db.query(
        'INSERT INTO articles (name, body, author) VALUES ($1, $2, $3)',
        [title, articleText, authors],
        (err, result) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Error saving the article.');
            }
            res.redirect('/');
        }
    );
});

app.get('/article/:id', (req, res) => {
    const articleId = parseInt(req.params.id, 10); // Convert id to an integer

    if (isNaN(articleId)) {
        // If the id is not a valid number, return a 400 Bad Request error
        return res.status(400).send('Invalid article ID.');
    }

    db.query(
        'SELECT * FROM articles WHERE id = $1',
        [articleId],
        (err, result) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Error fetching the article.');
            }
            if (result.rows.length === 0) {
                return res.status(404).send('Article not found.');
            }
            res.render('article', { article: result.rows[0] });
        }
    );
});

app.get('/search/:query', (req, res) => {
    const searchQuery = req.params.query;
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = 20;
    const offset = (page - 1) * limit;

    db.query(
        'SELECT id, name, author, SUBSTRING(body, 1, 100) AS snippet FROM articles WHERE name ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3',
        [`%${searchQuery}%`, limit, offset],
        (err, result) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Error searching for articles.');
            }

            const hasMore = result.rows.length === limit; // Check if there are more results
            res.render('search', {
                results: result.rows,
                query: searchQuery,
                currentPage: page,
                hasMore: hasMore
            });
        }
    );
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});