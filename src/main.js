const apiKey = 'UPqqGmgPxS9Bp0EewHXfGAKax5jqOHbW';
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('results');
const favoritesButton = document.getElementById('favoritesButton');
const filterButton = document.getElementById('filterButton');
const dropdownMenu = document.getElementById('dropdownMenu');

let showingFavorites = false;

searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) {
    showingFavorites = false;
    fetchGifs(query);
  }
});

favoritesButton.addEventListener('click', () => {
  showingFavorites = true;
  displayGifs(getFavorites());
});

resultsContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('.favorite-btn');
  if (!btn) return;

  const gif = {
    id: btn.dataset.id,
    url: btn.dataset.url,
    title: btn.dataset.title
  };

  toggleFavorite(gif);

  if (showingFavorites) {
    displayGifs(getFavorites());
  } else {
    btn.classList.toggle('active');
  }
});

async function fetchGifs(query) {
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const gifs = data.data.map(gif => ({
      id: gif.id,
      url: gif.images.fixed_width.url,
      title: gif.title || 'Geen titel'
    }));

    displayGifs(gifs);
  } catch (err) {
    console.error('Fout bij ophalen:', err);
    resultsContainer.innerHTML = '<p>Er ging iets mis.</p>';
  }
}

function displayGifs(gifs) {
 
  gifs = gifs.filter(gif => gif.id && gif.url);

  const favorites = getFavorites();

  resultsContainer.innerHTML = gifs.map(gif => {
    const isFavorite = favorites.some(f => f.id === gif.id);
    return `
      <div class="gif-item">
        <img src="${gif.url}" alt="${gif.title || 'Geen titel'}" />
        <div class="gif-title">${gif.title || 'Geen titel'}</div>
        <button class="favorite-btn ${isFavorite ? 'active' : ''}"
                data-id="${gif.id}"
                data-url="${gif.url}"
                data-title="${gif.title}">
          ⭐
        </button>
      </div>
    `;
  }).join('');
}

function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function toggleFavorite(gif) {
  if (!gif.id || !gif.url) return;

  const favorites = getFavorites();
  const index = favorites.findIndex(f => f.id === gif.id);

  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(gif);
  }

  saveFavorites(favorites);
}



filterButton.addEventListener('click', () => {
  dropdownMenu.classList.toggle('show');
});

dropdownMenu.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    const filterValue = e.target.getAttribute('data-filter');
    searchInput.value = filterValue;
    fetchGifs(filterValue);
    dropdownMenu.classList.remove('show');
  }
});