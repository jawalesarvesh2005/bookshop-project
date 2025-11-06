// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const PORT = 3000;

// Simple in-memory data loaded from JSON for persistence simplicity
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const booksFile = path.join(DATA_DIR, 'books.json');
const usersFile = path.join(DATA_DIR, 'users.json');

// seed data if not present
if (!fs.existsSync(booksFile)) {
  const sampleBooks = {
    "1": { "isbn":"978-0143127741", "title":"Book One", "author":"Alice", "reviews": {} },
    "2": { "isbn":"978-0262033848", "title":"Learning Node", "author":"Bob", "reviews": {} },
    "3": { "isbn":"978-0131103627", "title":"The C Programming Language", "author":"Kernighan", "reviews": {} }
  };
  fs.writeFileSync(booksFile, JSON.stringify(sampleBooks, null, 2));
}
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify({}, null, 2));
}

// helpers
function readJSON(fp){ return JSON.parse(fs.readFileSync(fp, 'utf8')); }
function writeJSON(fp, obj){ fs.writeFileSync(fp, JSON.stringify(obj, null, 2)); }

// ---- Public endpoints (General users) ----

// Task 1: Get the book list available in the shop.
app.get('/books', (req, res) => {
  const books = readJSON(booksFile);
  // return array of books with isbn as key
  res.json(Object.values(books));
});

// Task 2: Get the books based on ISBN.
app.get('/books/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const books = readJSON(booksFile);
  const found = Object.values(books).find(b => b.isbn === isbn || b.isbn.replace(/-/g,"") === isbn.replace(/-/g,""));
  if (!found) return res.status(404).json({ message: 'Book not found' });
  res.json(found);
});

// Task 3: Get all books by Author.
app.get('/books/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const books = readJSON(booksFile);
  const results = Object.values(books).filter(b => b.author.toLowerCase().includes(author));
  res.json(results);
});

// Task 4: Get all books based on Title
app.get('/books/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const books = readJSON(booksFile);
  const results = Object.values(books).filter(b => b.title.toLowerCase().includes(title));
  res.json(results);
});

// Task 5: Get book Review.
app.get('/books/:isbn/review', (req, res) => {
  const isbn = req.params.isbn;
  const books = readJSON(booksFile);
  const book = Object.values(books).find(b => b.isbn === isbn || b.isbn.replace(/-/g,"") === isbn.replace(/-/g,""));
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book.reviews || {});
});

// ---- Registration and login (simple) ----

// Task 6: Register New user
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username & password required' });
  const users = readJSON(usersFile);
  if (users[username]) return res.status(409).json({ message: 'User already exists' });
  users[username] = { username, password };
  writeJSON(usersFile, users);
  res.json({ message: 'User registered' });
});

// Task 7: Login as Registered user (returns a simple token)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(usersFile);
  const user = users[username];
  if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });
  // simple token (for assignment only) — not secure JWT
  const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
  res.json({ message: 'Login success', token, username });
});

// Middleware for protected routes: check token header 'x-auth-token' (simple check)
function authMiddleware(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'Missing token' });
  const decoded = Buffer.from(token, 'base64').toString('utf8');
  const username = decoded.split(':')[0];
  const users = readJSON(usersFile);
  if (!users[username]) return res.status(401).json({ message: 'Invalid token' });
  req.username = username;
  next();
}

// ---- Registered User endpoints ----

// Task 8: Add/Modify a book review.
app.post('/books/:isbn/review', authMiddleware, (req, res) => {
  const isbn = req.params.isbn;
  const { rating, comment } = req.body;
  if (typeof rating === 'undefined' && typeof comment === 'undefined') {
    return res.status(400).json({ message: 'rating or comment required' });
  }
  const books = readJSON(booksFile);
  const bookKey = Object.keys(books).find(k => books[k].isbn === isbn || books[k].isbn.replace(/-/g,"") === isbn.replace(/-/g,""));
  if (!bookKey) return res.status(404).json({ message: 'Book not found' });
  const book = books[bookKey];
  // a user can have only one review per book — store by username
  book.reviews = book.reviews || {};
  book.reviews[req.username] = { rating, comment, user: req.username, updatedAt: new Date().toISOString() };
  books[bookKey] = book;
  writeJSON(booksFile, books);
  res.json({ message: 'Review added/updated', review: book.reviews[req.username] });
});

// Task 9: Delete book review added by that particular user
app.delete('/books/:isbn/review', authMiddleware, (req, res) => {
  const isbn = req.params.isbn;
  const books = readJSON(booksFile);
  const bookKey = Object.keys(books).find(k => books[k].isbn === isbn || books[k].isbn.replace(/-/g,"") === isbn.replace(/-/g,""));
  if (!bookKey) return res.status(404).json({ message: 'Book not found' });
  const book = books[bookKey];
  if (!book.reviews || !book.reviews[req.username]) return res.status(404).json({ message: 'Review by this user not found' });
  delete book.reviews[req.username];
  books[bookKey] = book;
  writeJSON(booksFile, books);
  res.json({ message: 'Review deleted' });
});

// start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
