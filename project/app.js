const searchInput = document.getElementById("searchInput");
const bookList = document.getElementById("bookList");

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
    console.error("책 데이터를 불러오는 데 실패했습니다", err);
  }
}

// 1. renderBookList 함수에 클릭 이벤트 추가
function renderBookList(books) {
  bookList.innerHTML = books
    .map(
      (book) => `
      <div class="book-card">
        <img src="${book.thumbnail || 'assets/images/no-image.jpg'}" alt="${book.title}" />
        <h3>${book.title}</h3>
        <p>${book.authors.join(", ")}</p>
        <p>${book.publisher}</p>
      </div>
    `
    )
    .join("");

  // 2. 상세 정보 출력 함수 (아래에 따로 추가)
  const bookCards = document.querySelectorAll(".book-card");
  bookCards.forEach((card, i) => {
    card.addEventListener("click", () => {
      console.log("click:", books[i]);
      showBookDetail(books[i]);
    });
  });
}

function showBookDetail(book) {
  const bookDetail = document.getElementById("bookDetail");
  bookDetail.style.display = "block";
  bookDetail.innerHTML = `
      <div class="detail-wrapper">
        <img src="${book.thumbnail || 'assets/no-image.jpg'}" alt="${book.title}" />
        <div class="detail-text">
          <h2>${book.title}</h2>
          <p><strong>Authors:</strong> ${book.authors.join(", ")}</p>
          <p><strong>Publisher:</strong> ${book.publisher}</p>
          <p><strong>Published:</strong> ${book.datetime ? book.datetime.slice(0, 10) : "Unknown"}</p>
          <p><strong>Description:</strong><br>${book.contents || "No description available."}</p>
          <button id="closeDetail">Close</button>
        </div>
      </div>
    `;

  document.getElementById("closeDetail").addEventListener("click", () => {
    bookDetail.style.display = "none";
  });
}

