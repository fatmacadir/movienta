const loader = document.getElementById("loader");
const movieInput = document.getElementById("movieInput");
const message = document.getElementById("message");
const movieCard = document.getElementById("movieCard");
const sectionTitle = document.getElementById("sectionTitle");

let lastMovies = [];
let lastTitle = "Popüler Filmler";
let currentMovie = null;

function getLanguage() {
  return document.getElementById("language")?.value || localStorage.getItem("language") || "tr-TR";
}

function getText() {
  return translations[getLanguage()] || translations["tr-TR"];
}

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

  updateLanguage();
  loadPosterWall();
  loadPopularMovies();
  loadUpcomingMovies();
});

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
  const t = getText();

  lastMovies = movies;
  lastTitle = sectionTitle.textContent;

  movieCard.innerHTML = movies.slice(0, 12).map(movie => `
    <div class="result-item" onclick="showMovieDetail(${movie.id})">
      <img src="${getPoster(movie.poster_path)}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>${movie.release_date ? movie.release_date.slice(0, 4) : t.unknownYear}</p>
    </div>
  `).join("");

  movieCard.classList.remove("hidden");
}

async function loadPopularMovies() {
  const t = getText();

  sectionTitle.textContent = t.popularMovies;
  showLoader(t.loadingPopular);

  try {
    const response = await fetch(`/api/movie?popular=true&lang=${getLanguage()}`);
    const data = await response.json();

    displayMovieList(data.results || []);
    message.textContent = "";
  } catch (error) {
    message.textContent = t.errorPopular;
  } finally {
    hideLoader();
  }
}

async function loadMoviesByGenre(genreId, genreName) {
  const t = getText();

  sectionTitle.textContent = `${genreName} ${t.movies}`;
  showLoader(t.loadingGenre);

  try {
    const response = await fetch(`/api/movie?genreId=${genreId}&lang=${getLanguage()}`);
    const data = await response.json();

    displayMovieList(data.results || []);
    message.textContent = "";
  } catch (error) {
    message.textContent = t.errorGenre;
  } finally {
    hideLoader();
  }
}

async function searchMovie() {
  const t = getText();
  const movieName = movieInput.value.trim();

  if (movieName === "") {
    message.textContent = t.enterMovieName;
    return;
  }

  sectionTitle.textContent = t.searchResults;
  showLoader(t.loadingMovie);

  try {
    const response = await fetch(`/api/movie?query=${encodeURIComponent(movieName)}&lang=${getLanguage()}`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      movieCard.innerHTML = "";
      message.textContent = t.movieNotFound;
      return;
    }

    displayMovieList(data.results);
    message.textContent = `${data.results.length} ${t.resultsFound}`;

    document.querySelector(".movies-section").scrollIntoView({
      behavior: "smooth"
    });
  } catch (error) {
    message.textContent = t.generalError;
  } finally {
    hideLoader();
  }
}

async function showMovieDetail(tmdbId) {
  const t = getText();

  sectionTitle.textContent = t.movieDetail;
  showLoader(t.loadingDetail);

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
          <p><strong>${t.year}:</strong> ${movie.release_date ? movie.release_date.slice(0, 4) : t.unknown}</p>
          <p><strong>${t.rating}:</strong> ⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</p>
          <p><strong>${t.runtime}:</strong> ${movie.runtime ? movie.runtime + " " + t.minutes : t.unknown}</p>
          <p><strong>${t.description}:</strong> ${movie.overview || t.noDescription}</p>

          <button onclick="addToFavorites()">${t.addToFavorites}</button>
          <button onclick="goBackToResults()">${t.backToResults}</button>
        </div>
      </div>
    `;

    message.textContent = "";
  } catch (error) {
    message.textContent = t.errorDetail;
  } finally {
    hideLoader();
  }
}

function addToFavorites() {
  const t = getText();

  if (!currentMovie) return;

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  const exists = favorites.some(movie => movie.id === currentMovie.id);

  if (exists) {
    message.textContent = t.alreadyFavorite;
    return;
  }

  favorites.push(currentMovie);
  localStorage.setItem("favorites", JSON.stringify(favorites));

  message.textContent = t.addedFavorite;
}

function showFavorites() {
  const t = getText();

  sectionTitle.textContent = t.myFavorites;

  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    movieCard.innerHTML = "";
    message.textContent = t.noFavorites;
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
  const t = getText();

  const upcomingTitle = document.getElementById("upcomingTitle");
  if (upcomingTitle) {
    upcomingTitle.textContent = t.upcomingMovies;
  }

  try {
    const response = await fetch(`/api/movie?upcoming=true&lang=${getLanguage()}`);
    const data = await response.json();

    const upcomingContainer = document.getElementById("upcomingMovies");

    if (!data.results || data.results.length === 0) {
      upcomingContainer.innerHTML = `<p>${t.noUpcoming}</p>`;
      return;
    }

    upcomingContainer.innerHTML = data.results.slice(0, 6).map(movie => `
      <div class="result-item" onclick="showMovieDetail(${movie.id})">
        <img src="${getPoster(movie.poster_path)}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>${movie.release_date ? movie.release_date.slice(0, 4) : t.comingSoon}</p>
      </div>
    `).join("");

  } catch (error) {
    console.log("Upcoming movies could not load.", error);
  }
}

function loadPosterWall() {
  const posterWall = document.getElementById("posterWall");

  if (!posterWall) return;

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

  const repeatedPosters = [...posterPaths, ...posterPaths, ...posterPaths];

  posterWall.innerHTML = repeatedPosters.map(path => `
    <img src="https://image.tmdb.org/t/p/w300${path}" alt="Movie Poster">
  `).join("");
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
  setText("aboutText", t.about);

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

  setText("subtitle", t.subtitle);
  setText("searchBtn", t.searchButton);
  setText("sectionTitle", t.popularMovies);
  setText("upcomingTitle", t.upcomingMovies);

  if (movieInput) {
    movieInput.placeholder = t.searchPlaceholder;
  }
}

const languageSelect = document.getElementById("language");

if (languageSelect) {
  languageSelect.addEventListener("change", function () {
    localStorage.setItem("language", languageSelect.value);

    updateLanguage();
    loadPopularMovies();
    loadUpcomingMovies();
  });
}

window.addToFavorites = addToFavorites;
window.goBackToResults = goBackToResults;
window.searchMovie = searchMovie;
window.showMovieDetail = showMovieDetail;
window.showFavorites = showFavorites;
window.loadPopularMovies = loadPopularMovies;
window.loadMoviesByGenre = loadMoviesByGenre;
window.updateLanguage = updateLanguage;
