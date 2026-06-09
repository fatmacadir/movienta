const favoritesContainer = document.getElementById("favoritesContainer");

function getPoster(path) {
  return path
    ? `https://image.tmdb.org/t/p/w300${path}`
    : "https://via.placeholder.com/300x450?text=No+Poster";
}

function removeFromFavorites(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  favorites = favorites.filter(movie => movie.id !== id);

  localStorage.setItem("favorites", JSON.stringify(favorites));

  showFavoritesPage();
}

function showFavoritesPage() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    favoritesContainer.innerHTML =
      "<p>Henüz favori film eklenmedi.</p>";
    return;
  }

  favoritesContainer.innerHTML = favorites.map(movie => `
    <div class="result-item">
      <img src="${getPoster(movie.poster_path)}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>${movie.release_date ? movie.release_date.slice(0, 4) : "Yıl bilinmiyor"}</p>

      <button class="remove-btn"
              onclick="removeFromFavorites(${movie.id})">
        Favorilerden Kaldır
      </button>
    </div>
  `).join("");
}

window.removeFromFavorites = removeFromFavorites;

showFavoritesPage();
