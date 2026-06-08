const movieCard = document.getElementById("movieCard");
const categoryTitle = document.getElementById("categoryTitle");

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

function getPoster(path) {
  return path
    ? `https://image.tmdb.org/t/p/w300${path}`
    : "https://via.placeholder.com/300x450?text=No+Poster";
}

function getGenreIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("genre");
}

async function loadCategoryMovies() {
  const genreId = getGenreIdFromUrl();

  if (!genreId) {
    categoryTitle.textContent = "Kategoriler";
    movieCard.innerHTML = "<p>Lütfen bir kategori seçin.</p>";
    return;
  }

  const genreName = genreNames[genreId] || "Kategori";
  categoryTitle.textContent = `${genreName} Filmleri`;

  try {
    const response = await fetch(`/api/movie?genreId=${genreId}&lang=tr-TR`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      movieCard.innerHTML = "<p>Bu kategoride film bulunamadı.</p>";
      return;
    }

    movieCard.innerHTML = data.results.map(movie => `
      <div class="result-item">
        <img src="${getPoster(movie.poster_path)}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>${movie.release_date ? movie.release_date.slice(0, 4) : "Yıl bilinmiyor"}</p>
      </div>
    `).join("");

  } catch (error) {
    movieCard.innerHTML = "<p>Filmler yüklenemedi.</p>";
  }
}

loadCategoryMovies();
