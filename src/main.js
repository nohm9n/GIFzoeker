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





// Favorieten bewaren als Map
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

  const downloadBtn = document.createElement("button");
  downloadBtn.className = "download-btn";
  downloadBtn.textContent = "⬇️";
  downloadBtn.setAttribute("title", "Download GIF");
  downloadBtn.addEventListener("click", () => {
    downloadGif(gif.url, gif.title || 'gif');
  });

  wrapper.appendChild(img);
  wrapper.appendChild(likeBtn);
  wrapper.appendChild(downloadBtn);
  container.appendChild(wrapper);
}


function downloadGif(url, filename) {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${filename}.gif`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    })
    .catch(err => {
      console.error("Fout bij downloaden:", err);
      alert("Download mislukt.");
    });
}


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
    resultsContainer.innerHTML = '<p id="errorMsg">Er ging iets mis.</p>';
  }
}

function showError(message) {
  resultsContainer.innerHTML = `<p id="errorMsg">${message}</p>`;
}

//        Eventlisteners   

// Zoekfunctie inclusief validatie
function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    showError('Vul eerst een zoekterm in.');
    return;
  }
  fetchGifs(query);
}

searchButton.addEventListener('click', handleSearch);

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSearch();
  }
});

// Favorieten tonen
favoritesButton.addEventListener('click', () => {
  showingFavorites = true;
  displayGifs(Array.from(favorites.values()));
});

// Filter dropdown toggle + aria-update
filterButton.addEventListener('click', () => {
  const isShown = dropdownMenu.classList.toggle('show');
  filterButton.setAttribute('aria-expanded', isShown);
});

// Sluit dropdown als ergens anders geklikt wordt
document.addEventListener('click', (e) => {
  if (!filterButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.classList.remove('show');
    filterButton.setAttribute('aria-expanded', 'false');
  }
});

// Filter selectie
dropdownMenu.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    const filterValue = e.target.getAttribute('data-filter');
    searchInput.value = filterValue;
    fetchGifs(filterValue);
    dropdownMenu.classList.remove('show');
    filterButton.setAttribute('aria-expanded', 'false');
  }
});

// Favoriet knop - event delegation op container
resultsContainer.addEventListener('click', (e) => {
  // Favoriet toggelen
  if (e.target.classList.contains('favorite-btn')) {
    e.stopPropagation();

    const gifId = e.target.dataset.id;
    if (favorites.has(gifId)) {
      favorites.delete(gifId);
      e.target.textContent = '☆';
      e.target.classList.remove('active');
    } else {
      const gifElement = e.target.parentElement.querySelector('img');
      const gif = {
        id: gifId,
        url: gifElement.src,
        title: gifElement.getAttribute('data-title')
      };
      favorites.set(gifId, gif);
      e.target.textContent = '⭐';
      e.target.classList.add('active');
    }
    saveFavorites(Array.from(favorites.values()));
    if (showingFavorites) {
      displayGifs(Array.from(favorites.values()));
    }
    return; 
  }

  // Modal openen bij klikken op gif afbeelding
  const gifImg = e.target.closest('img');
  if (gifImg && gifImg.parentElement.classList.contains('gif-item')) {
    const title = gifImg.getAttribute('data-title');
    modalGif.src = gifImg.src;
    modalGif.alt = title;
    modalTitle.textContent = title;
    gifModal.classList.remove('hidden');
  }
});

// Modal sluiten bij klik op sluitknop of buiten modal 
closeModal.addEventListener('click', () => {
  gifModal.classList.add('hidden');
});
gifModal.addEventListener('click', (e) => {
  if (e.target === gifModal) {
    gifModal.classList.add('hidden');
  }
});

document.getElementById('toggleDarkMode').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('darkMode', isDark ? 'true' : 'false');
});