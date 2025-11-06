// client.js
const axios = require('axios');
const BASE = 'http://localhost:3000';

// Task 10: Get all books – Using an async callback function (async + callback)
function getAllBooksCallback(callback) {
  // using axios (which returns a promise) but we wrap it into function that takes callback
  (async () => {
    try {
      const resp = await axios.get(`${BASE}/books`);
      // simulate Node callback(err, data)
      callback(null, resp.data);
    } catch (err) {
      callback(err);
    }
  })();
}

// Task 11: Search by ISBN – Using Promises
function searchByISBNPromise(isbn) {
  return axios.get(`${BASE}/books/isbn/${encodeURIComponent(isbn)}`)
    .then(res => res.data);
}

// Task 12: Search by Author – Using async/await
async function searchByAuthorAsync(author) {
  const res = await axios.get(`${BASE}/books/author/${encodeURIComponent(author)}`);
  return res.data;
}

// Task 13: Search by Title - Using Promises
function searchByTitlePromise(title) {
  return axios.get(`${BASE}/books/title/${encodeURIComponent(title)}`)
    .then(res => res.data);
}

// Demo usage:
if (require.main === module) {
  // 10: getAllBooksCallback
  getAllBooksCallback((err, books) => {
    if (err) {
      console.error('Error fetching all books (callback):', err.message);
    } else {
      console.log('Task10 - All books (callback):');
      console.log(books);
      // print instruction showing screenshot filename for Task 10
      console.log('\nSave screenshot as: 10-getallbooks-async-callback.png\n');
    }
  });

  // 11: searchByISBNPromise
  searchByISBNPromise('978-0143127741')
    .then(book => {
      console.log('Task11 - Search by ISBN (Promise):');
      console.log(book);
      console.log('\nSave screenshot as: 11-search-isbn-promise.png\n');
    })
    .catch(err => console.error('Task11 error:', err.response ? err.response.data : err.message));

  // 12: searchByAuthorAsync
  (async () => {
    try {
      const results = await searchByAuthorAsync('Alice');
      console.log('Task12 - Search by Author (async/await):');
      console.log(results);
      console.log('\nSave screenshot as: 12-search-author-async.png\n');
    } catch (err) {
      console.error('Task12 error:', err.response ? err.response.data : err.message);
    }
  })();

  // 13: searchByTitlePromise
  searchByTitlePromise('C Programming')
    .then(results => {
      console.log('Task13 - Search by Title (Promise):');
      console.log(results);
      console.log('\nSave screenshot as: 13-search-title-promise.png\n');
    })
    .catch(err => console.error('Task13 error:', err.response ? err.response.data : err.message));
}

module.exports = { getAllBooksCallback, searchByISBNPromise, searchByAuthorAsync, searchByTitlePromise };
