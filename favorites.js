const favoritesContainer = document.getElementById("favoritesContainer");

let currentMovie = null;

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

function removeFromFavorites(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  favorites = favorites.filter(movie => movie.id !== id);

  localStorage.setItem("favorites", JSON.stringify(favorites));

  closeFavoriteModal();
  showFavoritesPage();
}

function toggleFavoriteMenu(id, event) {
  event.stopPropagation();

  const menu = document.getElementById(`fav-menu-${id}`);

  document.querySelectorAll(".favorite-menu").forEach(item => {
    if (item !== menu) {
      item.classList.remove("show");
    }
  });

  menu.classList.toggle("show");
}

async function showFavoriteMovieDetail(tmdbId) {
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

    const modal = document.getElementById("favoriteModal");
    const modalBody = document.getElementById("favoriteModalBody");

    modalBody.innerHTML = `
      <div class="category-detail">
        <img src="${getPoster(movie.poster_path)}" alt="${movie.title}">

        <div class="category-detail-info">
          <h2>${movie.title}</h2>
          <p><strong>${t.year}:</strong> ${movie.release_date ? movie.release_date.slice(0, 4) : t.unknown}</p>
          ${ratingBadge(movie)}
          <p><strong>${t.runtime}:</strong> ${movie.runtime ? movie.runtime + " " + t.minutes : t.unknown}</p>
          <p><strong>${t.description}:</strong> ${movie.overview || t.noDescription}</p>

          <div class="modal-actions">
            <button onclick="removeFromFavorites(${movie.id})">Favorilerden Çıkar</button>
            <button onclick="closeFavoriteModal()">${t.backToResults}</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

  } catch (error) {
    alert(t.errorDetail);
  }
}

function closeFavoriteModal() {
  const modal = document.getElementById("favoriteModal");

  if (modal) {
    modal.classList.add("hidden");
  }

  document.body.style.overflow = "";
}

function showFavoritesPage() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    favoritesContainer.innerHTML = "<p>Henüz favori film eklenmedi.</p>";
    return;
  }

  favoritesContainer.innerHTML = favorites.map(movie => `
    <div class="result-item favorite-card">
      <div class="poster-wrapper" onclick="showFavoriteMovieDetail(${movie.id})">
        <img src="${getPoster(movie.poster_path)}" alt="${movie.title}">

        <button class="menu-dots" onclick="toggleFavoriteMenu(${movie.id}, event)">
          ⋮
        </button>

        <div id="fav-menu-${movie.id}" class="favorite-menu" onclick="event.stopPropagation()">
          <button onclick="removeFromFavorites(${movie.id})">
            Favorilerden Çıkar
          </button>
        </div>
      </div>

      <h3>${movie.title}</h3>
      <p>${movie.release_date ? movie.release_date.slice(0, 4) : "Yıl bilinmiyor"}</p>
    </div>
  `).join("");
}

document.addEventListener("click", function () {
  document.querySelectorAll(".favorite-menu").forEach(menu => {
    menu.classList.remove("show");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("favoriteModal");

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeFavoriteModal();
      }
    });
  }
});

window.removeFromFavorites = removeFromFavorites;
window.toggleFavoriteMenu = toggleFavoriteMenu;
window.showFavoriteMovieDetail = showFavoriteMovieDetail;
window.closeFavoriteModal = closeFavoriteModal;

showFavoritesPage();
