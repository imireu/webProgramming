const searchInput = document.getElementById("searchInput");
const bookList = document.getElementById("bookList");
let curatedBooks = []; // 현재 렌더링된 책 저장

const curatedIsbns = [
  "1194232094", "1193480159", "1168230217", "8970599827", "1194232116",
  "1189356910", "8932461368", "1189356589", "4887063261", "8998441071",
  "1193773032", "1189356236", "8932023646", "8937462141", "8932041059",
  "8980385544", "8940860144", "8932318301", "8990641705", "8970122125",
  "1189356813", "8994207708", "8994207627", "8994207775"
];

// 검색 기능
searchInput.addEventListener("keyup", (e) => {
  const query = e.target.value.trim();
  if (query.length > 1) {
    fetchBooks(query);
  }
});

async function fetchBooks(query) {
  const url = `https://dapi.kakao.com/v3/search/book?target=title&query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: "KakaoAK f4906d2bc6590e1f813b127700db09ae" },
    });
    const data = await res.json();
    renderBookList(data.documents);
  } catch (err) {
    console.error("Loading err", err);
  }
}

// 초기 리스트 불러오기
window.addEventListener("DOMContentLoaded", () => {
  curatedBooks = [];
  curatedIsbns.forEach((isbn) => fetchBookByIsbn(isbn));
});

async function fetchBookByIsbn(isbn) {
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v3/search/book?target=isbn&query=${isbn}`,
      { headers: { Authorization: "KakaoAK f4906d2bc6590e1f813b127700db09ae" } }
    );
    const data = await res.json();
    if (data.documents.length > 0) {
      curatedBooks.push(data.documents[0]);
      renderBookCard(data.documents[0]);
    }
  } catch (err) {
    console.error("Loading err:", err);
  }
}

function renderBookList(books) {
  curatedBooks = books;
  bookList.innerHTML = "";
  books.forEach(renderBookCard);
}

function renderBookCard(book) {
  const bookCard = document.createElement("div");
  bookCard.className = "book-card";

  const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
  const isBookmarked = bookmarks.includes(book.isbn);

  bookCard.innerHTML = `
    <a href="book.html?isbn=${book.isbn}">
      <img src="${book.thumbnail || 'assets/images/no-image.jpg'}" alt="${book.title}" />
      <h3>${book.title}</h3>
      <p>${book.authors.join(", ")}</p>
      <p>${book.publisher}</p>
    </a>
    <button class="bookmark-btn" data-isbn="${book.isbn}">
      ${isBookmarked ? "❤️" : "♡"}
    </button>
  `;

  const bookmarkBtn = bookCard.querySelector(".bookmark-btn");
  bookmarkBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const nickname = localStorage.getItem("nickname");
    if (!nickname) {
      alert("로그인 후 이용할 수 있습니다.");
      return;
    }

    const isbn = bookmarkBtn.dataset.isbn;
    const current = JSON.parse(localStorage.getItem("bookmarks")) || [];

    if (current.includes(isbn)) {
      const updated = current.filter((b) => b !== isbn);
      localStorage.setItem("bookmarks", JSON.stringify(updated));
      bookmarkBtn.textContent = "♡";
    } else {
      current.push(isbn);
      localStorage.setItem("bookmarks", JSON.stringify(current));
      bookmarkBtn.textContent = "❤️";
    }
  });

  bookList.appendChild(bookCard);
}

// 로그인 UI 상태 반영
function updateLoginUI() {
  const nickname = localStorage.getItem("nickname");
  const loginLink = document.getElementById("loginLink");
  const logoutBtn = document.getElementById("logoutBtn");

  if (nickname) {
    loginLink.textContent = `${nickname}님`;
    loginLink.href = "#";
    logoutBtn.style.display = "inline";

    // 로그인 시, 개인 찜 데이터 복원
    const saved = localStorage.getItem(`bookmarks_${nickname}`) || "[]";
    localStorage.setItem("bookmarks", saved);
  } else {
    loginLink.textContent = "Login";
    loginLink.href = "login.html";
    logoutBtn.style.display = "none";
  }
}

// 로그아웃 처리
document.getElementById("logoutBtn").addEventListener("click", () => {
  const nickname = localStorage.getItem("nickname");

  if (nickname) {
    const current = localStorage.getItem("bookmarks") || "[]";
    localStorage.setItem(`bookmarks_${nickname}`, current);
  }

  localStorage.removeItem("nickname");
  localStorage.removeItem("password");
  localStorage.removeItem("bookmarks");

  updateLoginUI();
  renderBookList(curatedBooks); // 찜 상태 재렌더링
});

// 페이지 로드시 로그인 UI 적용
window.addEventListener("DOMContentLoaded", () => {
  updateLoginUI();
});
