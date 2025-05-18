const apiKey = 'UPqqGmgPxS9Bp0EewHXfGAKax5jqOHbW';
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('results');

async function fetchGifs(query) {
  if (!query) {
    resultsContainer.innerHTML = '<p>Typ iets om te zoeken!</p>';
    return;
  }

  const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    displayGifs(data.data);
  } catch (error) {
    resultsContainer.innerHTML = '<p>Er ging iets mis bij het ophalen van de GIFs.</p>';
    console.error(error);
  }
}

function displayGifs(gifs) {
  if (gifs.length === 0) {
    resultsContainer.innerHTML = '<p>Geen GIFs gevonden.</p>';
    return;
  }

  resultsContainer.innerHTML = gifs
    .map(gif => `
      <div class="gif-item">
        <img src="${gif.images.fixed_width.url}" alt="${gif.title}" />
      </div>
    `)
    .join('');
}

searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  fetchGifs(query);
});


