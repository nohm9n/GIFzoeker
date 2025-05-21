const apiKey = 'UPqqGmgPxS9Bp0EewHXfGAKax5jqOHbW';
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('results');
const favoritesButton = document.getElementById('favoritesButton');
const filterButton = document.getElementById('filterButton');
const dropdownMenu = document.getElementById('dropdownMenu');

const gifModal = document.getElementById('gifModal');
const modalGif = document.getElementById('modalGif');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');

let showingFavorites = false;

// Favorieten bewaren als Map: key = gif.id, value = volledige gif object
let favorites = new Map(getFavorites().map(fav => [fav.id, fav]));

function saveFavorites(favsArray) {
  localStorage.setItem('favorites', JSON.stringify(favsArray));
}

function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}

function renderGifCard(gif, container) {
  const wrapper = document.createElement("div");
  wrapper.className = "gif-item";

  const img = document.createElement("img");
  img.src = gif.url;
  img.alt = gif.title || 'Geen titel';
  img.setAttribute('data-title', gif.title || 'Geen titel');

  const likeBtn = document.createElement("button");
  likeBtn.className = "favorite-btn";
  likeBtn.textContent = favorites.has(gif.id) ? "⭐" : "☆";

  likeBtn.dataset.id = gif.id;

  if (favorites.has(gif.id)) {
    likeBtn.classList.add("active");
  }

  likeBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // voorkomt dat modal opent bij klikken op button

    if (favorites.has(gif.id)) {
      favorites.delete(gif.id);
      likeBtn.textContent = "☆";
      likeBtn.classList.remove("active");
    } else {
      favorites.set(gif.id, gif);
      likeBtn.textContent = "⭐";
      likeBtn.classList.add("active");
    }

    // Favorieten opslaan als array van volledige GIF objecten
    saveFavorites(Array.from(favorites.values()));

    // Als je op favorieten pagina bent, direct updaten
    if (showingFavorites) {
      displayGifs(Array.from(favorites.values()));
    }
  });

  wrapper.appendChild(img);
  wrapper.appendChild(likeBtn);
  container.appendChild(wrapper);
}

// Toon GIFs in container, eerst leegmaken
function displayGifs(gifs) {
  resultsContainer.innerHTML = '';
  gifs.forEach(gif => renderGifCard(gif, resultsContainer));
}

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

    showingFavorites = false;
    displayGifs(gifs);
  } catch (err) {
    console.error('Fout bij ophalen:', err);
    resultsContainer.innerHTML = '<p>Er ging iets mis.</p>';
  }
}

// Eventlisteners

searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) {
    fetchGifs(query);
  }
});

favoritesButton.addEventListener('click', () => {
  showingFavorites = true;
  displayGifs(Array.from(favorites.values()));
});

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

// Modal openen bij klikken op GIF (niet op button)
resultsContainer.addEventListener('click', (e) => {
  const gifImg = e.target.closest('img');
  if (gifImg && gifImg.parentElement.classList.contains('gif-item')) {
    const title = gifImg.getAttribute('data-title');
    modalGif.src = gifImg.src;
    modalTitle.textContent = title;
    gifModal.classList.remove('hidden');
  }
});

closeModal.addEventListener('click', () => {
  gifModal.classList.add('hidden');
});
