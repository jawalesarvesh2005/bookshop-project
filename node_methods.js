const axios = require("axios");

// ✅ Task 10 – Get all books (async callback)
function getAllBooks(callback) {
  axios
    .get("http://localhost:3000/books")
    .then(response => callback(null, response.data))
    .catch(error => callback(error, null));
}

getAllBooks((err, data) => {
  if (err) console.error("❌ Error:", err.message);
  else console.log("✅ Task 10 – All Books:", data);
});

// ✅ Task 11 – Search by ISBN (Promise)
function getBookByISBN(isbn) {
  return axios.get(`http://localhost:3000/books/${isbn}`);
}

getBookByISBN("9780143127741")
  .then(res => console.log("✅ Task 11 – Book by ISBN:", res.data))
  .catch(err => console.error("❌ Error:", err.message));

// ✅ Task 12 – Search by Author (async/await)
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(
      `http://localhost:3000/books/author/${author}`
    );
    console.log("✅ Task 12 – Books by Author:", response.data);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

getBooksByAuthor("J.K. Rowling");

// ✅ Task 13 – Search by Title (async/await)
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(
      `http://localhost:3000/books/title/${title}`
    );
    console.log("✅ Task 13 – Books by Title:", response.data);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

getBooksByTitle("Harry Potter");
