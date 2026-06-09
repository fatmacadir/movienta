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

function toggleFavoriteMenu(id) {
  const menu = document.getElementById(`fav-menu-${id}`);

  document.querySelectorAll(".favorite-menu").forEach(item => {
    if (item !== menu) {
      item.classList.remove("show");
    }
  });

  menu.classList.toggle("show");
}

function showFavoritesPage() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    favoritesContainer.innerHTML = "<p>Henüz favori film eklenmedi.</p>";
    return;
  }

  favoritesContainer.innerHTML = favorites.map(movie => `
    <div class="result-item favorite-card">
      <div class="poster-wrapper">
        <img src="${getPoster(movie.poster_path)}" alt="${movie.title}">

        <button class="menu-dots" onclick="toggleFavoriteMenu(${movie.id})">
          ⋮
        </button>

        <div id="fav-menu-${movie.id}" class="favorite-menu">
          <button onclick="removeFromFavorites(${movie.id})">
            Favorilerden Çıkar
          </button>
        </div>
      </div>

      <h3>${movie.title}</h3>
      <p>${movie.release_date ? movie.release_date.slice(0, 4) : "Yıl bilinmiyor"}</p>
    </div>
  `).join("");
  document.addEventListener("mouseover", function (event) {
  document.querySelectorAll(".favorite-card").forEach(card => {
    if (!card.contains(event.target)) {
      const menu = card.querySelector(".favorite-menu");
      if (menu) {
        menu.classList.remove("show");
      }
    }
  });
});
  
}


window.removeFromFavorites = removeFromFavorites;
window.toggleFavoriteMenu = toggleFavoriteMenu;

showFavoritesPage();

document.addEventListener("mousemove", function (event) {

  if (
    !event.target.closest(".menu-dots") &&
    !event.target.closest(".favorite-menu")
  ) {

    document.querySelectorAll(".favorite-menu").forEach(menu => {
      menu.classList.remove("show");
    });

  }

});
