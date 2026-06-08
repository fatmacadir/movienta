const loader = document.getElementById("loader");
const movieInput = document.getElementById("movieInput");
const message = document.getElementById("message");
const movieCard = document.getElementById("movieCard");
const sectionTitle = document.getElementById("sectionTitle");

let lastMovies = [];
let lastTitle = "Popüler Filmler";
let currentMovie = null;

movieInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchMovie();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const savedLanguage = localStorage.getItem("language");

  if (savedLanguage && document.getElementById("language")) {
    document.getElementById("language").value = savedLanguage;
  }

  loadPosterWall();
  loadPopularMovies();
  loadUpcomingMovies();
});

function getLanguage() {
  return document.getElementById("language")?.value || "tr-TR";
}

function showLoader(text) {
  message.textContent = text;
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

function getPoster(path) {
  return path
    ? `https://image.tmdb.org/t/p/w300${path}`
    : "https://via.placeholder.com/300x450?text=No+Poster";
}

function displayMovieList(movies) {
  lastMovies = movies;
  lastTitle = sectionTitle.textContent;

  movieCard.innerHTML = movies.slice(0, 12).map(movie => `
    <div class="result-item" onclick="showMovieDetail(${movie.id})">
      <img src="${getPoster(movie.poster_path)}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>${movie.release_date ? movie.release_date.slice(0, 4) : "Yıl bilinmiyor"}</p>
    </div>
  `).join("");

  movieCard.classList.remove("hidden");
}

async function loadPopularMovies() {
  sectionTitle.textContent = "Popüler Filmler";
  showLoader("Popüler filmler yükleniyor...");

  try {
    const response = await fetch(`/api/movie?popular=true&lang=${getLanguage()}`);
    const data = await response.json();

    displayMovieList(data.results || []);
    message.textContent = "";
  } catch (error) {
    message.textContent = "Popüler filmler yüklenemedi.";
  } finally {
    hideLoader();
  }
}

async function loadMoviesByGenre(genreId, genreName) {
  sectionTitle.textContent = `${genreName} Filmleri`;
  showLoader(`${genreName} filmleri yükleniyor...`);

  try {
    const response = await fetch(`/api/movie?genreId=${genreId}&lang=${getLanguage()}`);
    const data = await response.json();

    displayMovieList(data.results || []);
    message.textContent = "";
  } catch (error) {
    message.textContent = "Kategori filmleri yüklenemedi.";
  } finally {
    hideLoader();
  }
}

async function searchMovie() {
  const movieName = movieInput.value.trim();

  if (movieName === "") {
    message.textContent = "Lütfen bir film adı gir.";
    return;
  }

  sectionTitle.textContent = "Arama Sonuçları";
  showLoader("Film aranıyor...");

  try {
    const response = await fetch(`/api/movie?query=${encodeURIComponent(movieName)}&lang=${getLanguage()}`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      movieCard.innerHTML = "";
      message.textContent = "Film bulunamadı. Başka bir isim dene.";
      return;
    }

    displayMovieList(data.results);
    message.textContent = `${data.results.length} sonuç bulundu.`;

    document.querySelector(".movies-section").scrollIntoView({
      behavior: "smooth"
    });
  } catch (error) {
    message.textContent = "Bir hata oluştu. Lütfen tekrar dene.";
  } finally {
    hideLoader();
  }
}

async function showMovieDetail(tmdbId) {
  sectionTitle.textContent = "Film Detayı";
  showLoader("Film detayı yükleniyor...");

  try {
    const detailResponse = await fetch(`/api/movie?tmdbDetailId=${tmdbId}&lang=${getLanguage()}`);
    const movie = await detailResponse.json();

    currentMovie = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average
    };

    movieCard.innerHTML = `
      <div class="detail-card">
        <img src="${getPoster(movie.poster_path)}" alt="${movie.title}">

        <div class="movie-info">
          <h2>${movie.title}</h2>
          <p><strong>Yıl:</strong> ${movie.release_date ? movie.release_date.slice(0, 4) : "Bilinmiyor"}</p>
          <p><strong>Puan:</strong> ⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</p>
          <p><strong>Süre:</strong> ${movie.runtime ? movie.runtime + " dakika" : "Bilinmiyor"}</p>
          <p><strong>Açıklama:</strong> ${movie.overview || "Açıklama bulunamadı."}</p>

          <button onclick="addToFavorites()">Favorilere Ekle</button>
          <button onclick="goBackToResults()">Sonuçlara Dön</button>
        </div>
      </div>
    `;

    message.textContent = "";
  } catch (error) {
    message.textContent = "Film detayı yüklenemedi.";
  } finally {
    hideLoader();
  }
}

function addToFavorites() {
  if (!currentMovie) return;

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  const exists = favorites.some(movie => movie.id === currentMovie.id);

  if (exists) {
    message.textContent = "Bu film zaten favorilerde.";
    return;
  }

  favorites.push(currentMovie);
  localStorage.setItem("favorites", JSON.stringify(favorites));

  message.textContent = "Film favorilere eklendi.";
}

function showFavorites() {
  sectionTitle.textContent = "Favorilerim";

  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    movieCard.innerHTML = "";
    message.textContent = "Henüz favori film eklenmedi.";
    return;
  }

  displayMovieList(favorites);
  message.textContent = "";
}

function goBackToResults() {
  sectionTitle.textContent = lastTitle;
  displayMovieList(lastMovies);

  document.querySelector(".movies-section").scrollIntoView({
    behavior: "smooth"
  });
}

async function loadUpcomingMovies() {
  try {
    const response = await fetch(`/api/movie?upcoming=true&lang=${getLanguage()}`);
    const data = await response.json();

    const upcomingContainer = document.getElementById("upcomingMovies");

    if (!data.results || data.results.length === 0) {
      upcomingContainer.innerHTML = "<p>Yakında çıkacak film bulunamadı.</p>";
      return;
    }

    upcomingContainer.innerHTML = data.results.slice(0, 6).map(movie => `
      <div class="result-item" onclick="showMovieDetail(${movie.id})">
        <img src="${getPoster(movie.poster_path)}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>${movie.release_date ? movie.release_date.slice(0, 4) : "Yakında"}</p>
      </div>
    `).join("");

  } catch (error) {
    console.log("Upcoming movies could not load.", error);
  }
}

function loadPosterWall() {
  const posterPaths = [
    "/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg",
    "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    "/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    "/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg",
    "/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg",
    "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    "/y95lQLnuNKdPAzw9F9Ab8kJ80c3.jpg",
    "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    "/kOVEVeg59E0wsnXmF9nrh6OmWII.jpg",
    "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
    "/hziiv14OpD73u9gAak4XDDfBKa2.jpg",
    "/vBZ0qvaRxqEhZwl6LWmruJqWE8Z.jpg",
    "/2yYP0PQjG8zVqturh1BAqu2Tixl.jpg",
    "/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg",
    "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg"
  ];

  const posterWall = document.getElementById("posterWall");
  const repeatedPosters = [...posterPaths, ...posterPaths, ...posterPaths];

  posterWall.innerHTML = repeatedPosters.map(path => `
    <img src="https://image.tmdb.org/t/p/w300${path}" alt="Movie Poster">
  `).join("");
}

window.addToFavorites = addToFavorites;
window.goBackToResults = goBackToResults;
window.searchMovie = searchMovie;
window.showMovieDetail = showMovieDetail;
window.showFavorites = showFavorites;
window.loadPopularMovies = loadPopularMovies;
window.loadMoviesByGenre = loadMoviesByGenre;

const languageSelect = document.getElementById("language");

if (languageSelect) {
  languageSelect.addEventListener("change", function () {
    localStorage.setItem("language", languageSelect.value);
    loadPopularMovies();
    loadUpcomingMovies();
  });
}
