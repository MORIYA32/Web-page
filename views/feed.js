let moviesData = [];
let userLikes = {};
let isSearchActive = false;
let filteredMovies = [];
let currentSortMode = '';
let currentFilterMode = '';
let adminRefreshTimer = null;
let watchedData = { };
let mediaGenres = [];
let currentTypeFilter = '';

function listGenres(medias) {
  const genreSet = new Set();

  medias.forEach((movie) => {
    const genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre];
    genres.forEach((g) => genreSet.add(g.trim()));
  });

  return Array.from(genreSet).sort();
}


async function loadWatchedFromServer() {
  const profileId = localStorage.getItem('selectedProfileId');
  if (!profileId) return;

  try {
    const res = await fetch(`/api/watched/list?profileId=${encodeURIComponent(profileId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      watchedData = await res.json();;
    } else {
      console.warn('Failed to load watched list');
    }
  } catch (err) {
    console.error('Error loading watched list:', err);
  }
}


function sortArrayByMode(arr, mode) {
  const copy = [...arr];
  switch (mode) {
    case 'az': return copy.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    case 'za': return copy.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    case 'year': return copy.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
    default: return copy;
  }
}

async function fetchContent() {
  try {
    const response = await fetch("/api/content");
    if (!response.ok) {
      throw new Error("Failed to fetch content");
    }
    const content = await response.json();
    moviesData = content;
    mediaGenres = listGenres(moviesData);
    return content;
  } catch (error) {
    console.error("Error fetching content:", error);
    return [];
  }
}

function idsHash(arr){ return arr.map(x => x._id || x.id).filter(Boolean).sort().join('|'); }

async function refreshIfChanged(){
  const before = idsHash(moviesData);
  await fetchContent();
  const after = idsHash(moviesData);
  if (before !== after){
    populateGenresDropdown();
    if (window.lastGenre) renderMoviesByGenre(window.lastGenre);
    else renderMovies();
  }
}

function startAdminAutoRefresh(){
  const email = (localStorage.getItem('userEmail') || '').toLowerCase();
  const isAdmin = localStorage.getItem('isAdmin') === 'true' || email === 'admin@admin.com';
  if (!isAdmin || adminRefreshTimer) return;
  adminRefreshTimer = setInterval(refreshIfChanged, 15000);
}


function populateGenresDropdown() {
  const genreMenu = document.getElementById('genreFilterMenu');
  if (!genreMenu) return;
  genreMenu.innerHTML = '';
  genreMenu.classList.add('three-columns');
  genreMenu.classList.add('three-columns');
  mediaGenres.forEach(genre => {
    const li = document.createElement('li');
    li.innerHTML = `<a class="dropdown-item genre-filter-item" href="#" data-genre="${genre}">${genre}</a>`;
    genreMenu.appendChild(li);
  });
  genreMenu.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const genre = e.currentTarget.dataset.genre;
      window.lastGenre = genre;
      window.location.href = `genre.html?genre=${encodeURIComponent(genre)}`;
    });
  });
}

// function saveLikesToStorage() {
//   const likesData = {};
//   moviesData.forEach(movie => { likesData[movie._id] = movie.likes; });
//   localStorage.setItem('netflixLikes', JSON.stringify(likesData));
// }

function loadLikesFromStorage() {
  const stored = localStorage.getItem('netflixLikes');
  if (!stored) return;
  const likesData = JSON.parse(stored);
  moviesData.forEach(movie => {
    if (likesData[movie._id] !== undefined) movie.likes = likesData[movie._id];
  });
}

// function saveUserLikesToStorage() {
//   localStorage.setItem('netflixUserLikes', JSON.stringify(userLikes));
// }

async function loadUserLikesFromServer() {
  const profileId = localStorage.getItem('selectedProfileId');
  if (!profileId) return;
  try {
    const response = await fetch(`/api/content/user-likes?profileId=${profileId}`);
    if (response.ok) {
      const data = await response.json();
      userLikes = {};
      (data.likedIds || []).forEach(id => { userLikes[id] = true; });
    }
  } catch (err) {
    console.error('Error loading user likes:', err);
  }
}

function isFullyWatched(item) {
  const watchedItems = watchedData.filter(w => String(w.contentId) === String(item._id));
  if (!watchedItems.length) return false;

  if ((item.type || '').toLowerCase() === 'movie') return true;

  const watchedCount = watchedItems.filter(w => w.completed).length;

  const totalEpisodes = (item.seasons || []).reduce(
    (sum, s) => sum + (s.episodes?.length || 0), 0
  );

  return totalEpisodes > 0 && watchedCount >= totalEpisodes;
}


function renderMovies(filterType = null) {
  const categoriesContainer = document.getElementById('categoriesContainer');
  if (!categoriesContainer) return;
  categoriesContainer.innerHTML = '';
  let filteredData = [...moviesData];
  if (filterType === 'movie') filteredData = filteredData.filter(m => (m.type || '').toLowerCase() === 'movie');
  else if (filterType === 'show') filteredData = filteredData.filter(m => (m.type || '').toLowerCase() === 'series');
  if (currentFilterMode === 'watched') {
    filteredData = filteredData.filter(m => {
        return isFullyWatched(m);
    });
  } else if (currentFilterMode === 'didnt_watch') {
    filteredData = filteredData.filter(m => {
        return !isFullyWatched(m);
    });
  }
  const userLikedContent = filteredData.filter(movie => userLikes[movie._id]);
  const userGenres = listGenres(userLikedContent);
  const categories = [
    {
      title: filterType === 'movie' ? 'Movies' : filterType === 'show' ? 'TV Shows' : 'Popular Shows on Netflix', 
      filter: (i) => (i.type || '').toLowerCase() === 'series',
      sort: (ms) => ms.sort((a,b)=>(b.likes||0)-(a.likes||0)),
      skipFallback: true
    },
    { title: filterType === 'movie' ? 'Movies' : filterType === 'show' ? 'TV Shows' : 'Popular Movies on Netflix', 
      filter: (i) => (i.type || '').toLowerCase() === 'movie',
      sort: (ms) => ms.sort((a,b)=>(b.likes||0)-(a.likes||0)),
      skipFallback: true
    },
    { title: 'Top Picks for You',
      filter: (movie) => {
        if (userGenres.length > 0) {
          const genres = Array.isArray(movie.genre)
            ? movie.genre
            : [movie.genre];

          const lowerUserGenres = userGenres.map((genre) =>
            genre.toLowerCase()
          );

          return genres.some((genre) =>
            lowerUserGenres.includes(genre.toLowerCase())
          );
        }

        return false;
      },
      skipFallback: true
    }
  ];

  mediaGenres.forEach((genre) => {
    const category = {
        title: `Newest ${genre}`,
        skipFallback: true,
        filter: (mediaItem) => {
            return mediaItem.genre.includes(genre);
        },
        displayLimit: 10,
        sort: (medias) => medias.sort((a, b) => {
            return -a.updatedAt.localeCompare(b.updatedAt);
        })
    }
    categories.push(category)
  })
  const mode = (document.getElementById('sortSelect')?.value || currentSortMode || '').trim();
  categories.forEach((category, categoryIndex) => {
    let categoryMovies = filteredData.filter(category.filter);
    if (category.sort) categoryMovies = category.sort([...categoryMovies]);
    if (mode) categoryMovies = sortArrayByMode(categoryMovies, mode);
    if (categoryMovies.length === 0) return;
    if (!category.skipFallback && categoryMovies.length < 3) {
      categoryMovies = [...filteredData];
      if (mode) categoryMovies = sortArrayByMode(categoryMovies, mode);
    }
    const infiniteMovies = categoryMovies.length >= 4 ? [...categoryMovies, ...categoryMovies, ...categoryMovies] : categoryMovies;
    const categoryRow = document.createElement('div');
    categoryRow.className = 'category-row';
    categoryRow.innerHTML = `
      <h3 class="category-title">${category.title}</h3>
      <div class="carousel-container">
        <button type="button" class="carousel-arrow left" data-category="${categoryIndex}">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="carousel-wrapper">
          <div class="carousel-track" data-category="${categoryIndex}"></div>
        </div>
        <button type="button" class="carousel-arrow right" data-category="${categoryIndex}">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    `;
    categoriesContainer.appendChild(categoryRow);
    const track = categoryRow.querySelector('.carousel-track');
    infiniteMovies.forEach((movie) => {
      const movieCard = createMovieCard(movie);
      track.appendChild(movieCard);
    });
    setupCarousel(categoryIndex, categoryMovies.length);
  });
}

function renderMoviesByGenre(selectedGenre) {
  window.lastGenre = selectedGenre;
  const categoriesContainer = document.getElementById('categoriesContainer');
  if (!categoriesContainer) return;
  categoriesContainer.innerHTML = '';
  const genreFiltered = moviesData.filter(movie => {
    const genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre];
    return genres.some(g => String(g).toLowerCase() === String(selectedGenre).toLowerCase());
  });
  const mode = (document.getElementById('sortSelect')?.value || currentSortMode || '').trim();
  const sorted = mode ? sortArrayByMode(genreFiltered, mode) : genreFiltered;
  if (sorted.length === 0) {
    categoriesContainer.innerHTML = `<div style="color: white; padding: 20px;">No titles found in "${selectedGenre}"</div>`;
    return;
  }
  const categoryRow = document.createElement('div');
  categoryRow.className = 'category-row';
  categoryRow.innerHTML = `
    <h3 class="category-title">${selectedGenre} Titles</h3>
    <div class="carousel-container">
      <button type="button" class="carousel-arrow left" data-category="genre">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="carousel-wrapper">
        <div class="carousel-track" data-category="genre"></div>
      </div>
      <button type="button" class="carousel-arrow right" data-category="genre">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  `;
  categoriesContainer.appendChild(categoryRow);
  const track = categoryRow.querySelector('.carousel-track');
  const infiniteMovies = sorted.length >= 4 ? [...sorted, ...sorted, ...sorted] : sorted;
  infiniteMovies.forEach(movie => {
    const card = createMovieCard(movie);
    track.appendChild(card);
  });
  setupCarousel('genre', sorted.length);
}

function createMovieCard(movie) {
  const movieCard = document.createElement('div');
  movieCard.className = 'movie-card';
  const userHasLiked = userLikes[movie._id] || false;
  const genreDisplay = Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre;
  const firstGenre = Array.isArray(movie.genre) ? (movie.genre[0] || '') : movie.genre || '';
  movieCard.innerHTML = `
    <div class="movie-poster">
      <img src="${movie.thumbnail || movie.poster}" alt="${movie.title} poster">
      <div class="card-actions">
        <button class="action-btn play" data-id="${movie.id || movie._id}"><i class="fas fa-play"></i></button>
        <button class="action-btn like ${userHasLiked ? 'active' : ''}" data-like-id="${movie._id}"><i class="${userHasLiked ? 'fas' : 'far'} fa-thumbs-up"></i></button>
        <button class="action-btn more" data-genre="${firstGenre}"><i class="fas fa-chevron-down"></i></button>
      </div>
    </div>
    <div class="movie-info">
      <div class="movie-title">${movie.title}</div>
      <div class="movie-details">${movie.year} • ${movie.type}</div>
      <div class="movie-genre">${genreDisplay || ''}</div>
      <button class="like-btn ${userHasLiked ? 'liked' : ''}" data-movie-id="${movie._id}">
        <i class="heart-icon ${userHasLiked ? 'fas' : 'far'} fa-heart"></i>
        ${movie.likes || 0} ${(movie.likes || 0) === 1 ? 'like' : 'likes'}
      </button>
    </div>
  `;
  movieCard.addEventListener('click', (e) => {
    if (!e.target.closest('.like-btn') && !e.target.closest('.card-actions')) {
      const movieId = movie.id || movie._id;
      if (!movieId) return;

      // Detect where we are
      const fromPage = window.location.pathname.includes('genre.html')
        ? `genre.html${fromGenre ? '?genre=' + encodeURIComponent(fromGenre) : ''}`
        : 'feed.html';

      window.location.href = `details.html?id=${movieId}&from=${encodeURIComponent(fromPage)}`;
    }
  });

  const likeBtn = movieCard.querySelector('.like-btn');
  likeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleLike(movie._id);
  });
  const likeQuick = movieCard.querySelector('.action-btn.like');
  likeQuick.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleLike(movie._id);
  });
  const moreBtn = movieCard.querySelector('.action-btn.more');
  moreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openMoreLikeThis(firstGenre);
  });
  return movieCard;
}

function setupCarousel(categoryIndex, originalLength) {
  const track = document.querySelector(`.carousel-track[data-category="${categoryIndex}"]`);
  const leftBtn = document.querySelector(`.carousel-arrow.left[data-category="${categoryIndex}"]`);
  const rightBtn = document.querySelector(`.carousel-arrow.right[data-category="${categoryIndex}"]`);
  if (!track || !leftBtn || !rightBtn) return;
  let currentIndex = originalLength >= 4 ? originalLength : 0;
  const cardWidth = 290;
  track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
  if (originalLength < 4) {
    leftBtn.style.display = 'none';
    rightBtn.style.display = 'none';
    return;
  }
  rightBtn.addEventListener('click', () => {
    currentIndex += 4;
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    if (currentIndex >= originalLength * 2) {
      setTimeout(() => {
        track.style.transition = 'none';
        currentIndex = originalLength;
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        setTimeout(() => { track.style.transition = 'transform 0.5s ease'; }, 50);
      }, 500);
    }
  });
  leftBtn.addEventListener('click', () => {
    currentIndex -= 4;
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    if (currentIndex < 0) {
      setTimeout(() => {
        track.style.transition = 'none';
        currentIndex = originalLength;
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        setTimeout(() => { track.style.transition = 'transform 0.5s ease'; }, 50);
      }, 500);
    }
  });
}

async function toggleLike(movieId) {
  const profileId = localStorage.getItem('selectedProfileId');
  if (!profileId) return;
  const movie = moviesData.find(m => m._id === movieId);
  if (!movie) return;
  try {
    const response = await fetch(`/api/content/${movieId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedProfileId: profileId })
    });
    if (!response.ok) throw new Error('Failed to update like');
    const data = await response.json();
    console.log("FRONTEND RESPONSE:", data);
    console.log("MOVIE BEFORE UPDATE:", movie.likes, userLikes[movieId]);
    movie.likes = data.likes;
    userLikes[movieId] = data.userHasLiked;
    //saveLikesToStorage();
    //saveUserLikesToStorage();
    updateLikeButton(movieId, movie.likes, userLikes[movieId]);
    console.log("MOVIE AFTER UPDATE:", movie.likes, userLikes[movieId]);
  } catch (err) {
    console.error('Error updating like:', err);
  }
}

function updateLikeButton(movieId, likeCount, userHasLiked) {

  document.querySelectorAll(`[data-movie-id="${movieId}"]`).forEach(button => {
    const heartIcon = button.querySelector('.heart-icon');

    if (userHasLiked) {
      button.classList.add('liked');
      heartIcon?.classList.add('fas');
      heartIcon?.classList.remove('far');
    } else {
      button.classList.remove('liked');
      heartIcon?.classList.add('far');
      heartIcon?.classList.remove('fas');
    }

    button.innerHTML = `<i class="heart-icon ${userHasLiked ? 'fas' : 'far'} fa-heart"></i> ${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`;
  });

  document.querySelectorAll(`[data-like-id="${movieId}"]`).forEach(btn => {
    if (userHasLiked) {
      btn.classList.add('active');
      btn.innerHTML = `<i class="fas fa-thumbs-up"></i>`;
    } else {
      btn.classList.remove('active');
      btn.innerHTML = `<i class="far fa-thumbs-up"></i>`;
    }
  });
}


function toggleSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  if (!isSearchActive) {
    searchInput.classList.add('active');
    searchInput.focus();
    isSearchActive = true;
  } else if (searchInput.value.trim() === '') {
    searchInput.classList.remove('active');
    isSearchActive = false;
    hideSearchResults();
  }
}

function performSearch(query) {
  if (query.trim() === '') {
    hideSearchResults();
    return;
  }
  filteredMovies = moviesData.filter(movie => {
    const genreStr = Array.isArray(movie.genre) ? movie.genre.join(' ') : (movie.genre || '');
    return (movie.title || '').toLowerCase().includes(query.toLowerCase()) ||
           genreStr.toLowerCase().includes(query.toLowerCase()) ||
           (movie.type || '').toLowerCase().includes(query.toLowerCase());
  });
  const mode = (document.getElementById('sortSelect')?.value || currentSortMode || '').trim();
  const sorted = mode ? sortArrayByMode(filteredMovies, mode) : filteredMovies;
  showSearchResults(query, sorted);
}

function showSearchResults(query, results) {
  const trailerSection = document.querySelector('.trailer-section');
  const mainFeed = document.getElementById('mainFeed');
  const searchResults = document.getElementById('searchResults');
  const searchResultsTitle = document.getElementById('searchResultsTitle');
  const searchGrid = document.getElementById('searchGrid');
  if (trailerSection) trailerSection.style.display = 'none';
  if (mainFeed) mainFeed.style.display = 'none';
  if (searchResults) searchResults.style.display = 'block';
  if (searchResultsTitle) searchResultsTitle.textContent = `Search results for "${query}" (${results.length} ${results.length === 1 ? 'result' : 'results'})`;
  if (!searchGrid) return;
  searchGrid.innerHTML = '';
  searchGrid.style.display = 'grid';
  if (results.length === 0) {
    searchGrid.innerHTML = '<div style="color: white; text-align: center; width: 100%; margin-top: 50px;">No results found</div>';
    return;
  }
  results.forEach(movie => {
    const movieCard = createMovieCard(movie);
    searchGrid.appendChild(movieCard);
  });
}

function hideSearchResults() {
  const trailerSection = document.querySelector('.trailer-section');
  const mainFeed = document.getElementById('mainFeed');
  const searchResults = document.getElementById('searchResults');
  if (trailerSection) trailerSection.style.display = 'flex';
  if (mainFeed) mainFeed.style.display = 'block';
  if (searchResults) searchResults.style.display = 'none';
}

function checkAuthentication() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const selectedProfileName = localStorage.getItem('selectedProfileName');
  if (!isLoggedIn) {
    window.location.href = './login.html';
    return false;
  }
  if (!selectedProfileName) {
    window.location.href = './profiles.html';
    return false;
  }
  return true;
}

function updateWelcomeMessage() {
  const name = localStorage.getItem('selectedProfileName');
  const welcomeMessage = document.getElementById('welcome-message');
  if (welcomeMessage && name) welcomeMessage.textContent = `Welcome, ${name}!`;
}

function updateProfileDropdown() {
  const selectedAvatar = localStorage.getItem('selectedProfileAvatar');
  const profilePic = document.querySelector('.profile-pic');
  if (profilePic && selectedAvatar) profilePic.src = selectedAvatar;
}

function setActiveNavLink(activeId) {
  document.querySelectorAll('.nav-link, #genreDropdown').forEach(link => {
    if (link.id === activeId) link.classList.add('active');
    else link.classList.remove('active');
  });
}

function signOut() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('selectedProfileId');
  localStorage.removeItem('selectedProfileName');
  localStorage.removeItem('selectedProfileAvatar');
  localStorage.removeItem('netflixLikes');
  localStorage.removeItem('netflixUserLikes');
  window.location.href = './login.html';
}

function openMoreLikeThis(genre) {
  if (!genre) return;
  const modal = document.getElementById('moreLikeModal');
  const grid = document.getElementById('moreLikeGrid');
  const title = document.getElementById('moreLikeTitle');
  title.textContent = `More Like This • ${genre}`;
  grid.innerHTML = '';
  const results = moviesData.filter(m => {
    const gs = Array.isArray(m.genre) ? m.genre : [m.genre];
    return gs.some(g => String(g).toLowerCase() === String(genre).toLowerCase());
  });
  results.forEach(m => {
    const c = createMovieCard(m);
    grid.appendChild(c);
  });
  modal.style.display = 'block';
}

function closeMoreLikeThis() {
  const modal = document.getElementById('moreLikeModal');
  if (modal) modal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', async function () {
  if (!checkAuthentication()) return;
  updateWelcomeMessage();
  updateProfileDropdown();
  await fetchContent();
  await loadUserLikesFromServer();
  await loadWatchedFromServer();
  populateGenresDropdown();
  renderMovies();

    startAdminAutoRefresh();

  const searchIcon = document.getElementById('searchIcon');
  const searchInput = document.getElementById('searchInput');
  if (searchIcon) searchIcon.addEventListener('click', (e) => { e.preventDefault(); toggleSearch(); });
  if (searchInput) {
    searchInput.addEventListener('input', (e) => { performSearch(e.target.value); });
    searchInput.addEventListener('blur', (e) => {
      setTimeout(() => {
        if (e.target.value.trim() === '') {
          e.target.classList.remove('active');
          isSearchActive = false;
          hideSearchResults();
        }
      }, 200);
    });
  }

  const moviesLink = document.getElementById('moviesLink');
  const tvShowsLink = document.getElementById('tvShowsLink');
  const homeLink = document.getElementById('homeLink');
  const genreDropdown = document.getElementById('genreDropdown');

  if (moviesLink) moviesLink.addEventListener('click', (e) => { e.preventDefault(); setActiveNavLink('moviesLink'); window.lastGenre = undefined; currentTypeFilter = 'movie'; renderMovies('movie'); });
  if (tvShowsLink) tvShowsLink.addEventListener('click', (e) => { e.preventDefault(); setActiveNavLink('tvShowsLink'); window.lastGenre = undefined; currentTypeFilter = 'show'; renderMovies('show'); });
  if (homeLink) homeLink.addEventListener('click', (e) => { e.preventDefault(); setActiveNavLink('homeLink'); window.lastGenre = undefined; currentTypeFilter = ''; renderMovies(); });
  if (genreDropdown) genreDropdown.addEventListener('click', () => { setActiveNavLink('genreDropdown'); });

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    currentSortMode = sortSelect.value || '';
    sortSelect.addEventListener('change', () => {
      currentSortMode = sortSelect.value || '';
      const searchResultsVisible = document.getElementById('searchResults')?.style.display === 'block';
      if (searchResultsVisible) {
        const q = document.getElementById('searchInput')?.value || '';
        performSearch(q);
      } else if (window.lastGenre) {
        renderMoviesByGenre(window.lastGenre);
      } else {
        renderMovies();
      }
    });
  }

  const filterSelect = document.getElementById('filterSelect');
  if (filterSelect) {
    currentFilterMode = filterSelect.value || '';
    filterSelect.addEventListener('change', () => {
      currentFilterMode = filterSelect.value || '';
      const searchResultsVisible = document.getElementById('searchResults')?.style.display === 'block';
      if (searchResultsVisible) {
        const q = document.getElementById('searchInput')?.value || '';
        performSearch(q);
      } else if (window.lastGenre) {
        renderMoviesByGenre(window.lastGenre);
      } else {
        renderMovies(currentTypeFilter);
      }
    });
  }

  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) signOutBtn.addEventListener('click', (e) => { e.preventDefault(); signOut(); });

  const modalClose = document.getElementById('moreLikeClose');
  if (modalClose) modalClose.addEventListener('click', () => closeMoreLikeThis());
  document.getElementById('moreLikeModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'moreLikeModal') closeMoreLikeThis();
  });
});

// Global Play Button Handler (works for trailer section too)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.action-btn.play, .btn.play-btn');
  if (btn) {
    e.preventDefault();
    e.stopPropagation();

    const movieId = btn.dataset.id;
    if (movieId) {
      window.location.href = `details.html?id=${movieId}`;
    } else {
      console.warn('Play button clicked but no data-id found.');
    }
  }
});


//more info modal
const moreInfoBtn = document.querySelector('.trailer-buttons .info-btn');
const moreInfoModal = document.getElementById('moreInfoModal');
const moreInfoClose = document.getElementById('moreInfoClose');

moreInfoBtn.addEventListener('click', () => {
  moreInfoModal.style.display = 'flex';
});

moreInfoClose.addEventListener('click', () => {
  moreInfoModal.style.display = 'none';
});

moreInfoModal.addEventListener('click', (e) => {
  if(e.target === moreInfoModal) {
    moreInfoModal.style.display = 'none';
  }
});

