const params = new URLSearchParams(location.search);
const isbnRaw = params.get("isbn");
const isbn = isbnRaw?.split(" ")[0];
const bookDetail = document.getElementById("bookDetail");
let selectedRating = 0;

fetchBook();

async function fetchBook() {
  if (!isbn) {
    bookDetail.innerHTML = "<p>No book selected.</p>";
    return;
  }
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
    const book = data.documents[0];
    renderBook(book);
    const reviews = JSON.parse(localStorage.getItem(`reviews_${isbn}`)) || [];
    renderReviewList(reviews);
  } catch (e) {
    bookDetail.innerHTML = "<p>Failed to load book information.</p>";
  }
}

function renderBook(book) {
  bookDetail.innerHTML = `
    <div class="detail-wrapper">
      <img src="${book.thumbnail || 'assets/images/no-image.jpg'}" alt="${book.title}" />
      <div class="detail-text">
        <h2>${book.title}</h2>
        <div class="book-meta">
          ${book.authors.join(", ")} · ${book.publisher} · ${book.datetime.slice(0, 10)}<br/>
          ISBN: ${book.isbn}
        </div>
        <div class="book-description" >${book.contents || "No description available."}</div>
      </div>
    </div>
  `;
}

document.querySelectorAll("#starRating span").forEach((star) => {
  star.addEventListener("click", () => {
    selectedRating = parseInt(star.dataset.value);
    updateStarUI(selectedRating);
  });
});

function updateStarUI(score) {
  document.querySelectorAll("#starRating span").forEach((star) => {
    if (parseInt(star.dataset.value) <= score) {
      star.classList.add("selected");
    } else {
      star.classList.remove("selected");
    }
  });
}

document.getElementById("submitReview").addEventListener("click", () => {
  const nickname = localStorage.getItem("nickname");
  if (!nickname) {
    alert("로그인 후 작성 가능합니다.");
    return;
  }

  const text = document.getElementById("reviewText").value.trim();
  if (!text) return;

  const newReview = {
    nickname,
    rating: selectedRating,
    text,
    date: new Date().toISOString()
  };

  const saved = JSON.parse(localStorage.getItem(`reviews_${isbn}`)) || [];
  saved.push(newReview);
  localStorage.setItem(`reviews_${isbn}`, JSON.stringify(saved));
  document.getElementById("reviewText").value = "";
  selectedRating = 0;
  updateStarUI(0);
  renderReviewList(saved);
});

function renderReviewList(reviews) {
  const list = document.getElementById("reviewList");
  list.innerHTML = "";

  reviews.forEach((r) => {
    const li = document.createElement("li");

    const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);

    li.innerHTML = `
      <strong>${r.nickname}</strong> 
      <span class="review-rating">${stars}</span>
      <div>${r.text}</div>
      <div class="review-meta">${new Date(r.date).toLocaleString()}</div>
    `;
    list.appendChild(li);
  });
}

