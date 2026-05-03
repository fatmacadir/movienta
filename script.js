const apiKey = "";
const tmdbApiKey = "";

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

  if (movieName === "") {
    message.textContent = "Please enter a movie name.";
    movieCard.classList.add("hidden");
    return;
  }

  message.textContent = "Searching...";
  movieCard.classList.remove("hidden");

  try {
    const language = document.getElementById("language").value;
    const tmdbUrl = `/.netlify/functions/movie?query=${encodeURIComponent(movieName)}&lang=${language}`;    const tmdbResponse = await fetch(tmdbUrl);
    const tmdbData = await tmdbResponse.json();

    if (!tmdbData.results || tmdbData.results.length === 0) {
      message.textContent = "Movie not found. Please try another title.";
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
  message.textContent = "Loading movie details...";

  try {
    const detailUrl = `/.netlify/functions/movie?tmdbId=${tmdbId}`;    const detailResponse = await fetch(detailUrl);
    const detailData = await detailResponse.json();

    if (!detailData.imdb_id) {
      message.textContent = "IMDb information could not be found.";
      return;
    }

    getMovieDetailsFromOMDb(detailData.imdb_id);

  } catch (error) {
    message.textContent = "Could not load movie details.";
  }
}

async function getMovieDetailsFromOMDb(imdbID) {
  try {
    const omdbUrl = `/.netlify/functions/movie?imdbId=${imdbID}`;
    const response = await fetch(omdbUrl);
    const data = await response.json();

    movieCard.innerHTML = `
      <div class="detail-card">
        <img src="${data.Poster !== "N/A" ? data.Poster : "https://via.placeholder.com/220x330?text=No+Poster"}" alt="${data.Title}">

        <div class="movie-info">
          <h2>${data.Title}</h2>
          <p><strong>Year:</strong> <span class="value">${data.Year}</span></p>
          <p><strong>Genre:</strong> <span class="value">${data.Genre}</span></p>
          <p><strong>Director:</strong> <span class="value">${data.Director}</span></p>
          <p><strong>Actors:</strong> <span class="value">${data.Actors}</span></p>
          <p><strong>IMDb Rating:</strong> <span class="value rating">${data.imdbRating}</span></p>
          <p>${data.Plot}</p>

          <button onclick="searchMovie()">Back to Results</button>
        </div>
      </div>
    `;

    movieCard.classList.remove("hidden");
    message.textContent = "";

  } catch (error) {
    message.textContent = "Could not load movie information.";
  }
}
