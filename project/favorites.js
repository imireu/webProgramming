const bookList = document.getElementById("bookList");

// 로그인 확인
const nickname = localStorage.getItem("nickname");
if (!nickname) {
  alert("로그인 후 이용 가능합니다.");
  location.href = "login.html";
}

// 저장된 찜 목록 불러오기
const bookmarkedIsbns = JSON.parse(localStorage.getItem("bookmarks")) || [];

if (bookmarkedIsbns.length === 0) {
  bookList.innerHTML = "<p>찜한 책이 없습니다.</p>";
} else {
  Promise.all(
    bookmarkedIsbns.map((isbn) => {
      const isbn13 = isbn.split(" ").find(code => code.length === 13);
      return fetch(`https://dapi.kakao.com/v3/search/book?target=isbn&query=${isbn13}`, {
        headers: {
          Authorization: "KakaoAK f4906d2bc6590e1f813b127700db09ae",
        },
      }).then((res) => res.json());
    })
  )

    .then((results) => {
      const books = results.map((data) => data.documents[0]).filter(Boolean);
      console.log("렌더링할 책 개수:", books.length);
      renderBookList(books);
    })
    .catch((err) => {
      console.error("찜한 책 불러오기 실패:", err);
    });
}

// 렌더 함수
function renderBookList(books) {
  bookList.innerHTML = "";
  books.forEach((book) => {
    const bookCard = document.createElement("div");
    bookCard.className = "book-card";

    bookCard.innerHTML = `
      <a href="book.html?isbn=${book.isbn}">
        <img src="${book.thumbnail || 'assets/images/no-image.jpg'}" alt="${book.title}" />
        <h3>${book.title}</h3>
        <p>${book.authors.join(", ")}</p>
        <p>${book.publisher}</p>
      </a>
    `;
    bookList.appendChild(bookCard);
  });
}

function updateLoginUI() {
  const nickname = localStorage.getItem("nickname");
  const loginLink = document.getElementById("loginLink");
  const logoutBtn = document.getElementById("logoutBtn");

  if (nickname) {
    loginLink.textContent = `${nickname}님`;
    loginLink.href = "#";
    logoutBtn.style.display = "inline";
  } else {
    loginLink.textContent = "Login";
    loginLink.href = "login.html";
    logoutBtn.style.display = "none";
  }
}

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
  location.href = "index.html"; // 홈으로 이동
});

window.addEventListener("DOMContentLoaded", updateLoginUI);
