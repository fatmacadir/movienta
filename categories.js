const movieCard = document.getElementById("movieCard");
const categoryTitle = document.getElementById("categoryTitle");
const categoryModal = document.getElementById("categoryModal");
const categoryModalBody = document.getElementById("categoryModalBody");

let currentMovie = null;

const genreNames = {
  28: "Aksiyon",
  35: "Komedi",
  18: "Dram",
  27: "Korku",
  10749: "Romantik",
  878: "Bilim Kurgu",
  14: "Fantastik",
  16: "Animasyon",
  99: "Belgesel",
  53: "Gerilim"
};

function getLanguage() {
  return localStorage.getItem("language") || "tr-TR";
}

function getText() {
  return translations[getLanguage()] || translations["tr-TR"];
}

function getPoster(path) {
  return path
    ? `https://image.tmdb.org/t/p/w300${path}`
    : "https://via.placeholder.com/300x450?text=No+Poster";
}

function ratingBadge(movie) {
  const t = getText();

  return `
    <p>
      <strong>${t.rating}:</strong>
      <span class="rating-badge">
        ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
      </span>
    </p>
  `;
}

function getGenreIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("genre");
}

function addToFavorites() {
  const t = getText();

  if (!currentMovie) return;

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const exists = favorites.some(movie => movie.id === currentMovie.id);

  if (exists) {
    showToast(t.alreadyFavorite);
    return;
  }

  favorites.push(currentMovie);
  localStorage.setItem("favorites", JSON.stringify(favorites));

  showToast(t.addedFavorite);
}

async function showCategoryMovieDetail(tmdbId) {
  const t = getText();

  try {
    const response = await fetch(`/api/movie?tmdbDetailId=${tmdbId}&lang=${getLanguage()}`);
    const movie = await response.json();

    currentMovie = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average
    };

    categoryModalBody.innerHTML = `
      <div class="category-detail">
        <img src="${getPoster(movie.poster_path)}" alt="${movie.title}">

        <div class="category-detail-info">
          <h2>${movie.title}</h2>
          <p><strong>${t.year}:</strong> ${movie.release_date ? movie.release_date.slice(0, 4) : t.unknown}</p>
          ${ratingBadge(movie)}
          <p><strong>${t.runtime}:</strong> ${movie.runtime ? movie.runtime + " " + t.minutes : t.unknown}</p>
          <p><strong>${t.description}:</strong> ${movie.overview || t.noDescription}</p>

          <div class="modal-actions">
            <button onclick="addToFavorites()">${t.addToFavorites}</button>
            <button onclick="closeCategoryModal()">${t.backToResults}</button>
          </div>
        </div>
      </div>
    `;

    categoryModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

  } catch (error) {
    showToast(t.errorDetail);
  }
}

function closeCategoryModal() {
  categoryModal.classList.add("hidden");
  document.body.style.overflow = "";
}

function updateLanguage() {
  const t = getText();

  const setText = (id, text) => {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  };

  setText("homeText", t.home);
  setText("categoryText", `${t.categories} ▾`);
  setText("favoriteText", t.favorites);

  setText("genreAction", t.action);
  setText("genreComedy", t.comedy);
  setText("genreDrama", t.drama);
  setText("genreHorror", t.horror);
  setText("genreRomance", t.romance);
  setText("genreSciFi", t.scifi);
  setText("genreFantasy", t.fantasy);
  setText("genreAnimation", t.animation);
  setText("genreDocumentary", t.documentary);
  setText("genreThriller", t.thriller);
}

updateLanguage();

async function loadCategoryMovies() {
  const genreId = getGenreIdFromUrl();

  if (!genreId) {
    categoryTitle.textContent = "Kategoriler";
    movieCard.innerHTML = "<p>Lütfen bir kategori seçin.</p>";
    return;
  }

  const genreName = genreNames[genreId] || "Kategori";
  categoryTitle.textContent = `${genreName} ${getText().movies}`;

  try {
    const response = await fetch(`/api/movie?genreId=${genreId}&lang=${getLanguage()}`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      movieCard.innerHTML = "<p>Bu kategoride film bulunamadı.</p>";
      return;
    }

    movieCard.innerHTML = data.results.map(movie => `
      <div class="result-item" onclick="showCategoryMovieDetail(${movie.id})">
        <img src="${getPoster(movie.poster_path)}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>${movie.release_date ? movie.release_date.slice(0, 4) : "Yıl bilinmiyor"}</p>
      </div>
    `).join("");

  } catch (error) {
    movieCard.innerHTML = "<p>Filmler yüklenemedi.</p>";
  }
}

categoryModal.addEventListener("click", function (event) {
  if (event.target === categoryModal) {
    closeCategoryModal();
  }
});

window.closeCategoryModal = closeCategoryModal;
window.showCategoryMovieDetail = showCategoryMovieDetail;
window.addToFavorites = addToFavorites;

loadCategoryMovies();

function showToast(text) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}
