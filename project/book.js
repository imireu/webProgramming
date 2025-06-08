const params = new URLSearchParams(location.search);
const isbnRaw = params.get("isbn");
const isbn = isbnRaw?.split(" ")[0];
const bookDetail = document.getElementById("bookDetail");
let selectedRating = 0;

let currentBook = null;

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
    currentBook = book;
    const reviews = JSON.parse(localStorage.getItem(`reviews_${isbn}`)) || [];
    renderBook(book, reviews);
    renderReviewList(reviews);
  } catch (e) {
    bookDetail.innerHTML = "<p>Failed to load book information.</p>";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const nickname = localStorage.getItem("nickname");
  const loginLink = document.getElementById("loginLink");
  const logoutBtn = document.getElementById("logoutBtn");

  if (nickname) {
    loginLink.textContent = nickname + "님";
    loginLink.href = "#";
    logoutBtn.style.display = "inline-block";
  } else {
    loginLink.textContent = "Login";
    loginLink.href = "login.html";
    logoutBtn.style.display = "none";
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("nickname");
    location.href = "index.html";
  });
});

function renderBook(book, reviews) {
  const avgData = calculateAverageRating(reviews);

  bookDetail.innerHTML = `
    <div class="detail-wrapper">
      <img src="${book.thumbnail || 'assets/images/no-image.jpg'}" alt="${book.title}" />
      <div class="detail-text">
        <h2>${book.title}</h2>
        <div class="book-meta">
          ${book.authors.join(", ")} · ${book.publisher} · ${book.datetime.slice(0, 10)}<br/>
        </div>
        ${avgData
      ? `<div class="book-average-rating">평균 별점: ${avgData.stars} (${avgData.avg})</div>`
      : `<div class="book-average-rating">아직 별점 없음</div>`
    }
        <div class="book-description">${book.contents || "No description available."}</div>
      </div>
    </div>
  `;
}

function calculateAverageRating(reviews) {
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avg = total / reviews.length;
  const rounded = Math.round(avg * 10) / 10;
  const stars = "★".repeat(Math.round(avg)) + "☆".repeat(5 - Math.round(avg));
  return { avg: rounded, stars };
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
  renderBook(currentBook, saved); // 평균 별점 업데이트
  renderReviewList(saved);
});

function renderReviewList(reviews) {
  const list = document.getElementById("reviewList");
  list.innerHTML = "";

  reviews.forEach((r, index) => {
    const li = document.createElement("li");
    const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
    const currentUser = localStorage.getItem("nickname");

    li.innerHTML = `
     <strong>${r.nickname}</strong> 
     <span class="review-rating">${stars}</span>
     <div>${r.text}</div>
     <div class="review-meta">${new Date(r.date).toLocaleString()}</div>
      ${r.nickname === currentUser
        ? `<button class="delete-review" data-index="${index}">삭제</button>`
        : ""
      }
    `;
    list.appendChild(li);
  });

  document.querySelectorAll(".delete-review").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index);
      const reviewToDelete = reviews[idx];
      const currentUser = localStorage.getItem("nickname");

      if (reviewToDelete.nickname !== currentUser) {
        alert("본인이 작성한 리뷰만 삭제할 수 있습니다.");
        return;
      }

      const updated = [...reviews.slice(0, idx), ...reviews.slice(idx + 1)];
      localStorage.setItem(`reviews_${isbn}`, JSON.stringify(updated));
      renderBook(currentBook, updated); // 삭제 후 평균 별점 갱신
      renderReviewList(updated);
    });
  });
}
