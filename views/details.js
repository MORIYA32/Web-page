let currentContent = null;
let userLikes = {};

const urlParams = new URLSearchParams(window.location.search);
const contentId = urlParams.get('id');

function checkAuthentication() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    window.location.href = './login.html';
    return false;
  }
  return true;
}

function loadUserLikesFromStorage() {
  const stored = localStorage.getItem('userLikes');
  if (stored) {
    userLikes = JSON.parse(stored);
  }
}

function saveUserLikesToStorage() {
  localStorage.setItem('userLikes', JSON.stringify(userLikes));
}

async function fetchContentDetails(id) {
  try {
    const response = await fetch(`/api/content`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch content');
    const allContent = await response.json();
    return allContent.find(item => item._id === id) || null;
  } catch (error) {
    console.error('Error fetching content:', error);
    return null;
  }
}

function normalizeVideoPath(path) {
  if (!path) return '';
  return '/' + String(path).replace(/\\/g, '/').replace(/^\/+/, '');
}

function pickVideoSrc(item) {
  if (!item) return '';
  if (item.type === 'movie') {
    return item.resolvedVideoUrl || item.videoUrl || normalizeVideoPath(item.trailerUrl) || '';
  } else if (item.type === 'series') {
    const s0 = (item.seasons || [])[0];
    const ep0 = (s0?.episodes || [])[0];
    return (ep0?.resolvedVideoUrl || ep0?.videoUrl || '');
  }
  return '';
}

function loadPlayer(src) {
  const trailerPlayer = document.getElementById('trailerPlayer');
  if (!trailerPlayer) return;
  if (!src) {
    console.warn('No video source found for this content.');
    return;
  }
  trailerPlayer.setAttribute('playsinline', '');
  trailerPlayer.setAttribute('preload', 'metadata');
  trailerPlayer.src = src;
  trailerPlayer.load();
}

async function fetchWikipediaUrl(actorName) {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(actorName)}`
    );
    if (response.ok) {
      const data = await response.json();
      return data.content_urls?.desktop?.page || null;
    }
  } catch (error) {
    console.error(`Error fetching Wikipedia for ${actorName}:`, error);
  }
  return null;
}

function asArray(x) {
  return Array.isArray(x) ? x : (x ? [x] : []);
}
function joinOrDash(arr) {
  const flat = asArray(arr).filter(Boolean);
  return flat.length ? flat.join(', ') : '—';
}

async function updateContentDetails() {
  document.getElementById('contentTitle').textContent = currentContent.title || '';
  document.getElementById('contentYear').textContent = currentContent.year || '';
  document.getElementById('contentType').textContent = currentContent.type === 'series' ? 'TV Series' : 'Movie';

  const genres = (Array.isArray(currentContent.genre) && currentContent.genre.length)
    ? currentContent.genre
    : (currentContent.genres || []);
  document.getElementById('contentGenre').textContent = joinOrDash(genres);

  const actorsContainer = document.getElementById('contentActors');
  actorsContainer.innerHTML = '';
  const actors = asArray(currentContent.actors);

  for (let i = 0; i < actors.length; i++) {
    const actor = actors[i];
    const wikipediaUrl = await fetchWikipediaUrl(actor);

    if (wikipediaUrl) {
      const link = document.createElement('a');
      link.href = wikipediaUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = actor;
      link.className = 'actor-link';
      actorsContainer.appendChild(link);
    } else {
      const span = document.createElement('span');
      span.textContent = actor;
      actorsContainer.appendChild(span);
    }

    if (i < actors.length - 1) {
      actorsContainer.appendChild(document.createTextNode(', '));
    }
  }

  document.getElementById('contentDescription').textContent =
    currentContent.description || 'No description available.';

  const likeButton = document.getElementById('likeButton');
  const userHasLiked = userLikes[currentContent._id] === true;
  if (userHasLiked) {
    likeButton.classList.add('liked');
    likeButton.innerHTML = '<i class="fas fa-heart"></i> Liked';
  } else {
    likeButton.classList.remove('liked');
    likeButton.innerHTML = '<i class="far fa-heart"></i> Like';
  }
}

async function fetchAndDisplayRatings() {
  if (!currentContent?._id) return;

  try {
    const response = await fetch(`/api/content/${currentContent._id}/ratings`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch ratings');

    const data = await response.json();
    if (!data?.ratings) return;

    const ratingsSection = document.getElementById('ratingsSection');
    const imdbRating = document.getElementById('imdbRating');
    const rtRating = document.getElementById('rtRating');

    let hasRatings = false;

    if (data.ratings.imdb != null && data.ratings.imdb !== 'N/A') {
      imdbRating.querySelector('.rating-value').textContent = String(data.ratings.imdb);
      imdbRating.style.display = 'flex';
      hasRatings = true;
    }

    if (data.ratings.rottenTomatoes != null && data.ratings.rottenTomatoes !== 'N/A') {
      const rtVal = String(data.ratings.rottenTomatoes);
      rtRating.querySelector('.rating-value').textContent =
        rtVal.endsWith('%') ? rtVal : `${rtVal}%`;
      rtRating.style.display = 'flex';
      hasRatings = true;
    }

    if (hasRatings) {
      ratingsSection.style.display = 'flex';
    }
  } catch (error) {
    console.error('Error fetching ratings:', error);
  }
}

function displayEpisodes() {
  if (currentContent.type !== 'series') return;

  const episodesSection = document.getElementById('episodesSection');
  const seasonSelect = document.getElementById('seasonSelect');
  const episodesList = document.getElementById('episodesList');

  episodesSection.style.display = 'block';
  seasonSelect.innerHTML = '';

  (currentContent.seasons || []).forEach(season => {
    const option = document.createElement('option');
    option.value = season.seasonNumber;
    option.textContent = `Season ${season.seasonNumber}`;
    seasonSelect.appendChild(option);
  });

  function displaySeasonEpisodes(seasonNumber) {
    const season = (currentContent.seasons || []).find(s => s.seasonNumber == seasonNumber);
    episodesList.innerHTML = '';

    (season?.episodes || []).forEach(episode => {
      const episodeCard = document.createElement('div');
      episodeCard.className = 'episode-card';
      episodeCard.innerHTML = `
        <h4>Episode ${episode.episodeNumber}</h4>
        <p>${episode.episodeTitle || ''}</p>
      `;

      episodeCard.addEventListener('click', () => {
        window.location.href = `player.html?id=${currentContent._id}&season=${seasonNumber}&episode=${episode.episodeNumber}`;
      });

      episodesList.appendChild(episodeCard);
    });
  }

  const firstSeason = (currentContent.seasons || [])[0];
  if (firstSeason) {
    displaySeasonEpisodes(firstSeason.seasonNumber);
  }

  seasonSelect.addEventListener('change', (e) => {
    displaySeasonEpisodes(e.target.value);
  });
}

async function toggleLike() {
  const likeButton = document.getElementById('likeButton');
  const userHasLiked = userLikes[currentContent._id] === true;

  try {
    const response = await fetch(`/api/content/${currentContent._id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ increment: !userHasLiked })
    });

    if (!response.ok) throw new Error('Failed to update like');

    userLikes[currentContent._id] = !userHasLiked;
    saveUserLikesToStorage();

    if (userLikes[currentContent._id]) {
      likeButton.classList.add('liked');
      likeButton.innerHTML = '<i class="fas fa-heart"></i> Liked';
    } else {
      likeButton.classList.remove('liked');
      likeButton.innerHTML = '<i class="far fa-heart"></i> Like';
    }
  } catch (error) {
    console.error('Error toggling like:', error);
  }
}

async function initializeDetailsPage() {
  if (!checkAuthentication()) return;

  if (!contentId) {
    window.location.href = './feed.html';
    return;
  }

  loadUserLikesFromStorage();

  currentContent = await fetchContentDetails(contentId);

  if (!currentContent) {
    alert('Content not found');
    window.location.href = './feed.html';
    return;
  }

  const src = pickVideoSrc(currentContent);
  loadPlayer(src);

  updateContentDetails();
  fetchAndDisplayRatings();
  displayEpisodes();

  document.getElementById('backButton').addEventListener('click', () => {
    window.location.href = './feed.html';
  });

  document.getElementById('playButton').addEventListener('click', () => {
    window.location.href = `player.html?id=${currentContent._id}`;
  });

  document.getElementById('likeButton').addEventListener('click', toggleLike);
}

document.addEventListener('DOMContentLoaded', initializeDetailsPage);
