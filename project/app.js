const searchInput = document.getElementById("searchInput");
const bookList = document.getElementById("bookList");

const curatedIsbns = [
  "1194232094",
  "1193480159",
  "1168230217",
  "8970599827",
  "1194232116",
  "1189356910",
  "8932461368",
  "1189356589",
  "4887063261",
  "8998441071",
  "1193773032",
  "1189356236",
  "8932023646",
  "8937462141",
  "8932041059",
  "8980385544",
  "8940860144",
  "8932318301",
  "8990641705",
  "8970122125",
  "1189356813",
  "8994207708",
  "8994207627",
  "8994207775"

];

// ✅ 검색 기능
searchInput.addEventListener("keyup", (e) => {
  const query = e.target.value.trim();
  if (query.length > 1) {
    fetchBooks(query);
  }
});

// ✅ 검색어 기반 책 목록 불러오기

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

// ✅ 감각적인 추천 리스트 불러오기
window.addEventListener("DOMContentLoaded", () => {
  curatedIsbns.forEach((isbn) => fetchBookByIsbn(isbn));
});

async function fetchBookByIsbn(isbn) {
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v3/search/book?target=isbn&query=${isbn}`,
      {
        headers: {
          Authorization: "KakaoAK f4906d2bc6590e1f813b127700db09ae",
        },
      }
    );
    const data = await res.json();
    if (data.documents.length > 0) {
      renderBookCard(data.documents[0]);
    }
  } catch (err) {
    console.error("추천 책 불러오기 실패:", err);
  }
}

// ✅ 검색 결과용 리스트 출력
function renderBookList(books) {
  bookList.innerHTML = ""; // 기존 추천 책 초기화
  books.forEach(renderBookCard);
}

// ✅ 공통: 책 하나 렌더링
function renderBookCard(book) {
  console.log(book.isbn, book.title);
  const bookCard = document.createElement("a");
  bookCard.className = "book-card";
  bookCard.href = `book.html?isbn=${book.isbn}`;
  bookCard.innerHTML = `
    <img src="${book.thumbnail || 'assets/images/no-image.jpg'}" alt="${book.title}" />
    <h3>${book.title}</h3>
    <p>${book.authors.join(", ")}</p>
    <p>${book.publisher}</p>
  `;
  bookList.appendChild(bookCard);
}