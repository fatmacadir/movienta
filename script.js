const loader = document.getElementById("loader");
const movieInput = document.getElementById("movieInput");
const message = document.getElementById("message");
const movieCard = document.getElementById("movieCard");

movieInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchMovie();
  }
});

async function searchMovie() {
  const movieName = movieInput.value.trim();
  const languageSelect = document.getElementById("language");
  const language = languageSelect ? languageSelect.value : "tr-TR";

  if (movieName === "") {
    message.textContent = "Please enter a movie name.";
    movieCard.classList.add("hidden");
    return;
  }

  message.textContent = "Searching...";
  loader.classList.remove("hidden");
  movieCard.classList.add("hidden");

  try {
    const tmdbUrl = `/api/movie?query=${encodeURIComponent(movieName)}&lang=${language}`;
    const tmdbResponse = await fetch(tmdbUrl);
    const tmdbData = await tmdbResponse.json();

    if (!tmdbData.results || tmdbData.results.length === 0) {
      message.textContent = "Movie not found. Please try another title.";
      loader.classList.add("hidden");
      return;
    }

    const resultsHtml = tmdbData.results.slice(0, 10).map(movie => {
      const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
        : "https://via.placeholder.com/100x150?text=No+Poster";

      return `
        <div class="result-item" onclick="getMovieDetailsFromTMDb(${movie.id})">
          <img src="${posterUrl}" alt="${movie.title}">
          <div>
            <h3>${movie.title}</h3>
            <p>${movie.release_date ? movie.release_date.slice(0, 4) : "Unknown year"}</p>
          </div>
        </div>
      `;
    }).join("");

    movieCard.innerHTML = resultsHtml;
    movieCard.classList.remove("hidden");
    message.textContent = `${tmdbData.results.length} result(s) found.`;
    loader.classList.add("hidden");

  } catch (error) {
    message.textContent = "Something went wrong. Please try again.";
    loader.classList.add("hidden");
  }
}

async function getMovieDetailsFromTMDb(tmdbId) {
  const languageSelect = document.getElementById("language");
  const language = languageSelect ? languageSelect.value : "tr-TR";

  message.textContent = "Loading movie details...";
  loader.classList.remove("hidden");

  try {
    const detailUrl = `/api/movie?tmdbDetailId=${tmdbId}&lang=${language}`;
    const detailResponse = await fetch(detailUrl);
    const tmdbDetail = await detailResponse.json();

    const imdbUrl = `/api/movie?tmdbId=${tmdbId}`;
    const imdbResponse = await fetch(imdbUrl);
    const imdbData = await imdbResponse.json();

    if (!imdbData.imdb_id) {
      message.textContent = "IMDb information could not be found.";
      loader.classList.add("hidden");
      return;
    }

    getMovieDetailsFromOMDb(imdbData.imdb_id, tmdbDetail, tmdbId);
    
  } catch (error) {
    message.textContent = "Could not load movie details.";
    loader.classList.add("hidden");
  }
}

async function getMovieDetailsFromOMDb(imdbID, tmdbDetail, tmdbId) {
  try {
    const omdbUrl = `//api/movie?imdbId=${imdbID}`;
    const response = await fetch(omdbUrl);
    const data = await response.json();

    const movieTitle = tmdbDetail.title || data.Title;
    const moviePlot = tmdbDetail.overview || data.Plot || "No description available.";

    const language = document.getElementById("language").value;
    
    const similarResponse = await fetch(`/api/movie?similarId=${tmdbId}&lang=${language}`);
    const similarData = await similarResponse.json();
    
    const similarMoviesHtml = similarData.results && similarData.results.length > 0
      ? similarData.results.slice(0, 5).map(movie => {
          const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
            : "https://via.placeholder.com/100x150?text=No+Poster";
    
          return `
            <div class="similar-item" onclick="getMovieDetailsFromTMDb(${movie.id})">
              <img src="${posterUrl}" alt="${movie.title}">
              <p>${movie.title}</p>
            </div>
          `;
        }).join("")
      : "<p>No similar movies found.</p>";

   movieCard.innerHTML = `
      <div class="detail-card">
        <img src="${data.Poster !== "N/A" ? data.Poster : "https://via.placeholder.com/220x330?text=No+Poster"}" alt="${movieTitle}">
    
        <div class="movie-info">
          <h2>${movieTitle}</h2>
          <p><strong>Year:</strong> <span class="value">${data.Year}</span></p>
          <p><strong>Genre:</strong> <span class="value">${data.Genre}</span></p>
          <p><strong>Director:</strong> <span class="value">${data.Director}</span></p>
          <p><strong>Actors:</strong> <span class="value">${data.Actors}</span></p>
          <p><strong>IMDb Rating:</strong> <span class="value rating">${data.imdbRating}</span></p>
          <p>${moviePlot}</p>
    
          <button onclick="searchMovie()">Back to Results</button>
    
          <div class="similar-section">
            <h3>You may also like</h3>
            <div class="similar-list">
              ${similarMoviesHtml}
            </div>
          </div>
    
        </div>
      </div>
    `;

    movieCard.classList.remove("hidden");
    message.textContent = "";
    loader.classList.add("hidden");

  } catch (error) {
    message.textContent = "Could not load movie information.";
    loader.classList.add("hidden");
  }

async function loadPosterWall() {
  try {
    const response = await fetch("/api/movie?popular=true&lang=tr-TR&page=1");
    const data = await response.json();

    if (!data.results) return;

    const posters = data.results
      .filter(movie => movie.poster_path)
      .slice(0, 20)
      .map(movie => {
        return `<img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">`;
      })
      .join("");

    document.getElementById("posterWall").innerHTML = posters;
  } catch (error) {
    console.log("Poster background could not be loaded.");
  }
}

loadPosterWall();
