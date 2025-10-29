let currentContent = null;
let userLikes = {};
let moviesData = [];
let currentSortMode = '';









const urlParams = new URLSearchParams(window.location.search);
const contentId = urlParams.get('id');

/* ---------- auth ---------- */
function checkAuthentication() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    window.location.href = './login.html';
    return false;
  }
  return true;
}

/* ---------- likes ---------- */
function loadUserLikesFromStorage() {
  const stored = localStorage.getItem('userLikes');
  if (stored) userLikes = JSON.parse(stored);
}

async function loadUserLikesFromServer() {
  const userId = localStorage.getItem('userId');
  if (!userId) return;
  try {
    const res = await fetch(`/api/content/user-likes?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      userLikes = {};
      data.likedIds.forEach(id => (userLikes[id] = true));
    }
  } catch (e) {
    console.error('Error loading user likes:', e);
  }
}

function saveUserLikesToStorage() {
  localStorage.setItem('userLikes', JSON.stringify(userLikes));
}

/* ---------- content ---------- */
async function fetchContentDetails(id) {
  try {
    const response = await fetch(`/api/content`);
    if (!response.ok) throw new Error('Failed to fetch content');
    const all = await response.json();
    return all.find(item => item.id == id);
  } catch (e) {
    console.error('Error fetching content:', e);
    return null;
  }
}

/* ---------- utils ---------- */
function normalizeVideoPath(path) {
  if (!path) return '';
  const cleaned = path.replace(/\\/g, '/');
  if (/^https?:\/\//i.test(cleaned) || cleaned.startsWith('blob:') || cleaned.startsWith('data:') || cleaned.startsWith('//')) {
    return cleaned;
  }
  return cleaned.startsWith('/') ? cleaned : '/' + cleaned;
}

function firstEpisodeUrlIfAny(content) {
  if (!content || content.type !== 'series') return '';
  const seasons = Array.isArray(content.seasons) ? [...content.seasons] : [];
  seasons.sort((a, b) => (a.seasonNumber ?? 0) - (b.seasonNumber ?? 0));
  for (const s of seasons) {
    const eps = Array.isArray(s.episodes) ? [...s.episodes] : [];
    eps.sort((a, b) => (a.episodeNumber ?? 0) - (b.episodeNumber ?? 0));
    const url = eps[0]?.videoUrl;
    if (url) return url;
  }
  return '';
}

function ensureNoNativeControlsDetails() {
  const v = document.getElementById('trailerPlayer');
  if (!v) return;
  v.controls = false;
  v.removeAttribute('controls');
  v.setAttribute('playsinline', '');
  v.setAttribute('disablepictureinpicture', '');
  v.setAttribute('controlslist', 'nodownload noplaybackrate nofullscreen noremoteplayback');
}

function fmtTime(t) {
  if (!Number.isFinite(t)) return '00:00';
  const s = String(Math.floor(t % 60)).padStart(2, '0');
  const m = String(Math.floor((t / 60) % 60)).padStart(2, '0');
  const h = Math.floor(t / 3600);
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

/* ---------- progress save (ONLY on pause) ---------- */
async function saveWatchProgress({ contentId, time, season = null, episode = null, context = 'details' }) {
  try {
    await fetch('/api/content/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId, season, episode, time, context })
    });
  } catch (err) {
    console.error('Failed to save progress', err);
  }
}

/* ---------- Wikipedia (actors) ---------- */
async function fetchWikipediaActorInfo(actorName) {
  try {
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(actorName)}`);
    if (response.ok) {
      const data = await response.json();
      return {
        url: data.content_urls?.desktop?.page || null,
        image: data.thumbnail?.source || null
      };
    }
  } catch (e) {
    console.error(`Error fetching Wikipedia for ${actorName}:`, e);
  }
  return { url: null, image: null };
}

/* ---------- trailer load ---------- */
function loadTrailer(trailerUrl) {
  const v = document.getElementById('trailerPlayer');
  const url = normalizeVideoPath(trailerUrl);
  ensureNoNativeControlsDetails();
  v.src = url;
  v.load();
  v.oncanplay = () => {
    ensureNoNativeControlsDetails();
    v.play().catch(() => {});
  };
}

/* ---------- UI fill ---------- */
async function updateContentDetails() {
  document.getElementById('contentTitle').textContent = currentContent.title;
  document.getElementById('contentYear').textContent = currentContent.year;
  document.getElementById('contentType').textContent = currentContent.type === 'series' ? 'TV Series' : 'Movie';
  document.getElementById('contentGenre').textContent = (currentContent.genre || []).join(', ');

  // actors with Wikipedia image + link
  const actorsContainer = document.getElementById('contentActors');
  actorsContainer.innerHTML = '';
  const actors = currentContent.actors || [];
  const infos = await Promise.all(actors.map(a => fetchWikipediaActorInfo(a)));

  actors.forEach((actor, idx) => {
    const info = infos[idx] || {};
    const card = document.createElement('div');
    card.className = 'actor-card';

    if (info.image) {
      const img = document.createElement('img');
      img.src = info.image;
      img.alt = actor;
      card.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'actor-placeholder';
      card.appendChild(placeholder);
    }

    if (info.url) {
      const link = document.createElement('a');
      link.href = info.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = actor;
      card.appendChild(link);
    } else {
      const span = document.createElement('span');
      span.textContent = actor;
      card.appendChild(span);
    }

    actorsContainer.appendChild(card);
  });

  const desc = (currentContent.description || '').trim();
  document.getElementById('contentDescription').textContent = desc || 'No description available.';

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
    const res = await fetch(`/api/content/${currentContent._id}/ratings`);
    if (!res.ok) throw new Error('Failed to fetch ratings');
    const data = await res.json();
    if (!data.ratings) return;

    const ratingsSection = document.getElementById('ratingsSection');
    const imdbRating = document.getElementById('imdbRating');
    const rtRating = document.getElementById('rtRating');
    let show = false;

    if (data.ratings.imdb) {
      imdbRating.querySelector('.rating-value').textContent = data.ratings.imdb;
      imdbRating.style.display = 'flex';
      show = true;
    }
    if (data.ratings.rottenTomatoes) {
      rtRating.querySelector('.rating-value').textContent = data.ratings.rottenTomatoes;
      rtRating.style.display = 'flex';
      show = true;
    }
    if (show) ratingsSection.style.display = 'flex';
  } catch (e) {
    console.error('Error fetching ratings:', e);
  }
}

/* ---------- episodes list (details page) ---------- */
function displayEpisodes() {
  if (currentContent.type !== 'series') return;

  const episodesSection = document.getElementById('episodesSection');
  const seasonSelect = document.getElementById('seasonSelect');
  const episodesList = document.getElementById('episodesList');

  episodesSection.style.display = 'block';
  seasonSelect.innerHTML = '';

  (currentContent.seasons || []).forEach(season => {
    const opt = document.createElement('option');
    opt.value = season.seasonNumber;
    opt.textContent = `Season ${season.seasonNumber}`;
    seasonSelect.appendChild(opt);
  });

  function renderSeason(seasonNumber) {
    const season = (currentContent.seasons || []).find(s => s.seasonNumber == seasonNumber);
    episodesList.innerHTML = '';
    (season?.episodes || []).forEach(ep => {
      const el = document.createElement('div');
      el.className = 'episode-card';
      el.innerHTML = `<h4>Episode ${ep.episodeNumber}</h4><p>${ep.episodeTitle || ''}</p>`;
      el.addEventListener('click', () => {
        // פתיחה תמיד מההתחלה
        window.location.href = `player.html?id=${currentContent.id}&season=${seasonNumber}&episode=${ep.episodeNumber}&reset=1`;
      });
      episodesList.appendChild(el);
    });
  }

  seasonSelect.addEventListener('change', e => renderSeason(e.target.value));
  renderSeason((currentContent.seasons || [])[0]?.seasonNumber);
}

/* ---------- like toggle ---------- */
async function toggleLike() {
  const userId = localStorage.getItem('userId');
  if (!userId) return;

  const likeButton = document.getElementById('likeButton');
  try {
    const res = await fetch(`/api/content/${currentContent._id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to update like');
    const data = await res.json();
    userLikes[currentContent._id] = data.userHasLiked;
    saveUserLikesToStorage();

    if (userLikes[currentContent._id]) {
      likeButton.classList.add('liked');
      likeButton.innerHTML = '<i class="fas fa-heart"></i> Liked';
    } else {
      likeButton.classList.remove('liked');
      likeButton.innerHTML = '<i class="far fa-heart"></i> Like';
    }
  } catch (e) {
    console.error('Error toggling like:', e);
  }
}

/* ---------- episodes/chapters drawer (details page) ---------- */
function openEpisodesDrawerFromDetails() {
  const drawer = document.getElementById('episodesDrawer');
  const backdrop = document.getElementById('episodesBackdrop');
  const titleElm = document.getElementById('drawerTitle');
  const seasonRow = document.getElementById('seriesSeasonRow');
  const epsList = document.getElementById('drawerEpisodesList');
  const chaptersEl = document.getElementById('drawerChaptersList');

  if (!currentContent) return;

  epsList.innerHTML = '';
  chaptersEl.innerHTML = '';
  chaptersEl.style.display = 'none';
  seasonRow.style.display = 'none';

  if (currentContent.type === 'series') {
    titleElm.textContent = 'Episodes';
    seasonRow.style.display = '';
    renderDrawerSeasonsDetails();
    const firstSeason = (currentContent.seasons || [])[0]?.seasonNumber ?? 1;
    renderDrawerEpisodesDetails(firstSeason);
  } else {
    titleElm.textContent = 'Chapters';
    const hasChapters = Array.isArray(currentContent.chapters) && currentContent.chapters.length > 0;
    if (hasChapters) {
      chaptersEl.style.display = '';
      renderDrawerChaptersDetails();
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'episode-row';
      btn.textContent = 'Restart trailer';
      btn.onclick = () => {
        closeEpisodesDrawerDetails();
        document.getElementById('trailerPlayer')?.play?.();
      };
      epsList.appendChild(btn);
    }
  }

  drawer.classList.add('open');
  backdrop.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.classList.add('drawer-open');
}

function closeEpisodesDrawerDetails() {
  const drawer = document.getElementById('episodesDrawer');
  const backdrop = document.getElementById('episodesBackdrop');
  drawer.classList.remove('open');
  backdrop.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('drawer-open');
}

function renderDrawerSeasonsDetails() {
  const sel = document.getElementById('drawerSeasonSelect');
  sel.innerHTML = '';
  (currentContent.seasons || [])
    .slice()
    .sort((a, b) => a.seasonNumber - b.seasonNumber)
    .forEach(s => {
      const o = document.createElement('option');
      o.value = s.seasonNumber;
      o.textContent = `Season ${s.seasonNumber}`;
      sel.appendChild(o);
    });
  sel.onchange = e => renderDrawerEpisodesDetails(Number(e.target.value));
}

function renderDrawerEpisodesDetails(seasonNumber) {
  const list = document.getElementById('drawerEpisodesList');
  list.innerHTML = '';
  const season = (currentContent.seasons || []).find(s => s.seasonNumber == seasonNumber);
  if (!season) return;
  season.episodes
    .slice()
    .sort((a, b) => a.episodeNumber - b.episodeNumber)
    .forEach(ep => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'episode-row';
      btn.innerHTML = `<strong>Episode ${ep.episodeNumber}</strong> ${ep.episodeTitle ? '– ' + ep.episodeTitle : ''}`;
      btn.onclick = () => {
        // פתיחה תמיד מההתחלה
        window.location.href = `player.html?id=${currentContent.id}&season=${season.seasonNumber}&episode=${ep.episodeNumber}&reset=1`;
      };
      list.appendChild(btn);
    });
}

function renderDrawerChaptersDetails() {
  const list = document.getElementById('drawerChaptersList');
  list.innerHTML = '';
  (currentContent.chapters || []).forEach((ch, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'episode-row';
    btn.textContent = ch.title ? `Chapter ${i + 1} – ${ch.title}` : `Chapter ${i + 1}`;
    btn.onclick = () => {
      closeEpisodesDrawerDetails();
      const v = document.getElementById('trailerPlayer');
      const start = Number(ch.startSeconds || 0);
      if (v) {
        v.currentTime = start;
        v.play().catch(() => {});
      }
    };
    list.appendChild(btn);
  });
}

function navigatePrevNextFromDetails(dir) {
  if (!currentContent || currentContent.type !== 'series') return;
  const seasons = (currentContent.seasons || []).slice().sort((a, b) => a.seasonNumber - b.seasonNumber);
  if (!seasons.length) return;

  let s = 0;
  let e = 0;
  const eps = () => seasons[s].episodes.slice().sort((a, b) => a.episodeNumber - b.episodeNumber);

  if (dir === 'next') {
    if (e + 1 < eps().length) e++;
    else if (s + 1 < seasons.length) {
      s++;
      e = 0;
    } else return;
  } else {
    if (e - 1 >= 0) e--;
    else if (s - 1 >= 0) {
      s--;
      e = eps().length - 1;
    } else return;
  }

  const seasonNum = seasons[s].seasonNumber;
  const epNum = eps()[e].episodeNumber;
  // פתיחה תמיד מההתחלה
  window.location.href = `player.html?id=${currentContent.id}&season=${seasonNum}&episode=${epNum}&reset=1`;
}

/* ---------- control bar wiring ---------- */
function wireDetailsControlBar() {
  const v = document.getElementById('trailerPlayer');
  if (!v) return;

  const btnPlayPause = document.getElementById('btnPlayPause');
  const iconPlayPause = btnPlayPause?.querySelector('i');
  const btnBack10 = document.getElementById('btnBack10');
  const btnForward10 = document.getElementById('btnForward10');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const btnEpisodes = document.getElementById('btnEpisodes');
  const btnPrevEp = document.getElementById('btnPrevEpisode');
  const btnNextEp = document.getElementById('btnNextEpisode');
  const seek = document.getElementById('seek');
  const timeCur = document.getElementById('timeCurrent');
  const timeTot = document.getElementById('timeTotal');

  ensureNoNativeControlsDetails();

  const isSeries = currentContent?.type === 'series';
  const hasChapters = Array.isArray(currentContent?.chapters) && currentContent.chapters.length > 0;

  if (btnEpisodes) {
    const label = isSeries ? 'Episodes' : 'Chapters';
    const shouldHave = isSeries || hasChapters;
    btnEpisodes.style.display = '';
    btnEpisodes.title = label;
    btnEpisodes.setAttribute('aria-label', label);
    btnEpisodes.disabled = !shouldHave;
    btnEpisodes.classList.toggle('disabled', !shouldHave);
    btnEpisodes.setAttribute('aria-disabled', String(!shouldHave));
    btnEpisodes.onclick = openEpisodesDrawerFromDetails;
  }

  if (btnPrevEp) {
    btnPrevEp.style.visibility = isSeries ? 'visible' : 'hidden';
    btnPrevEp.onclick = () => navigatePrevNextFromDetails('prev');
  }
  if (btnNextEp) {
    btnNextEp.style.visibility = isSeries ? 'visible' : 'hidden';
    btnNextEp.onclick = () => navigatePrevNextFromDetails('next');
  }

  if (btnPlayPause) btnPlayPause.onclick = () => (v.paused ? v.play() : v.pause());
  v.addEventListener('play', () => {
    if (iconPlayPause) {
      iconPlayPause.className = 'fas fa-pause';
      btnPlayPause?.setAttribute('aria-label', 'Pause');
    }
  });
  v.addEventListener('pause', () => {
    if (iconPlayPause) {
      iconPlayPause.className = 'fas fa-play';
      btnPlayPause?.setAttribute('aria-label', 'Play');
    }
    // <<< שמירה רק בעת Pause >>>
    const cid = currentContent?._id || currentContent?.id || contentId;
    const t = Number.isFinite(v.currentTime) ? Math.floor(v.currentTime) : 0;
    if (cid != null) {
      // שומר בלי season/episode כי זה טריילר/תצוגה מקדימה בדף הפרטים
      saveWatchProgress({ contentId: cid, time: t, context: 'details-trailer' });
    }
  });

  if (btnBack10) btnBack10.onclick = () => (v.currentTime = Math.max(0, (v.currentTime || 0) - 10));
  if (btnForward10) btnForward10.onclick = () => {
    const d = v.duration || 0;
    v.currentTime = Math.min(d, (v.currentTime || 0) + 10);
  };

  if (seek) {
    seek.oninput = () => {
      if (!Number.isFinite(v.duration)) return;
      v.currentTime = (Number(seek.value) / 100) * v.duration;
      seek.style.setProperty('--seek', `${seek.value}%`);
    };
  }

  if (btnFullscreen) {
    btnFullscreen.onclick = () => {
      const wrapper = document.getElementById('video-wrapper') || v;
      const doc = document;
      const isFS =
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.msFullscreenElement ||
        doc.mozFullScreenElement;
      if (!isFS) {
        (wrapper.requestFullscreen ||
          wrapper.webkitRequestFullscreen ||
          wrapper.msRequestFullscreen ||
          wrapper.mozRequestFullScreen)?.call(wrapper);
      } else {
        (doc.exitFullscreen ||
          doc.webkitExitFullscreen ||
          doc.msExitFullscreen ||
          doc.mozCancelFullScreen)?.call(doc);
      }
    };
  }

  function syncUI() {
    const d = v.duration || 0;
    const c = v.currentTime || 0;
    const pct = d ? (c / d) * 100 : 0;
    if (seek) {
      seek.value = pct;
      seek.style.setProperty('--seek', `${pct}%`);
    }
    if (timeCur) timeCur.textContent = fmtTime(c);
    if (timeTot) timeTot.textContent = fmtTime(d);
  }

  v.addEventListener('loadedmetadata', syncUI);
  v.addEventListener('timeupdate', syncUI);
  syncUI();

  const force = () => ensureNoNativeControlsDetails();
  ['loadedmetadata', 'canplay', 'play', 'pause', 'timeupdate', 'enterpictureinpicture', 'webkitpresentationmodechanged', 'emptied']
    .forEach(ev => v.addEventListener(ev, force));
  setTimeout(force, 100);
  setTimeout(force, 400);
  setTimeout(force, 1000);
}

/* ---------- init ---------- */
async function initializeDetailsPage() {
  if (!checkAuthentication()) return;
  if (!contentId) {
    window.location.href = './feed.html';
    return;
  }

  await loadUserLikesFromServer();

  currentContent = await fetchContentDetails(contentId);
  if (!currentContent) {
    alert('Content not found');
    window.location.href = './feed.html';
    return;
  }

  const previewUrl =
    currentContent.videoUrl ||
    currentContent.trailerUrl ||
    firstEpisodeUrlIfAny(currentContent);
  if (previewUrl) loadTrailer(previewUrl);

  updateContentDetails();
  fetchAndDisplayRatings();
  displayEpisodes();

  document.getElementById('backButton').addEventListener('click', () => {
    window.location.href = './feed.html';
  });

  document.getElementById('playButton').addEventListener('click', () => {
    const v = document.getElementById('trailerPlayer');
    const url =
      currentContent.type === 'series'
        ? firstEpisodeUrlIfAny(currentContent) || currentContent.trailerUrl
        : currentContent.videoUrl || currentContent.trailerUrl;
    if (!url) return;

    const normalized = normalizeVideoPath(url);
    const currentSrc = v.currentSrc || v.src || '';
    if (!currentSrc.endsWith(normalized)) {
      v.src = normalized;
      v.load();
    }
    v.play().catch(() => v.focus());
    v.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.getElementById('likeButton').addEventListener('click', toggleLike);
  document.getElementById('closeEpisodes')?.addEventListener('click', closeEpisodesDrawerDetails);
  document.getElementById('episodesBackdrop')?.addEventListener('click', closeEpisodesDrawerDetails);

  wireDetailsControlBar();
}





async function fetchContent() {
  try {
    const response = await fetch('/api/content');
    if (!response.ok) throw new Error('Failed to fetch content');
    const content = await response.json();
    moviesData = Array.isArray(content) ? content : [];
    return moviesData;
  } catch (err) {
    console.error('Error fetching content:', err);
    return [];
  }
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
        <button class="action-btn add"><i class="fas fa-plus"></i></button>
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
      window.location.href = `details.html?id=${movie.id}`;
    }
  });

  const playBtn = movieCard.querySelector('.action-btn.play');
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    window.location.href = `details.html?id=${movie.id}`;
  });

  const moreBtn = movieCard.querySelector('.action-btn.more');
  moreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openMoreLikeThis(firstGenre);
  });
  return movieCard;
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



// 1. Get the movie ID from the URL
// Rename urlParams to params
const params = new URLSearchParams(window.location.search);
const currentMovieId = params.get('id'); // e.g., "7"


// 2. Make sure moviesData is loaded (from your fetchContent)
fetchContent().then(() => {
  // 3. Find the current movie by id
  const currentMovie = moviesData.find(
    m => String(m.id) === currentMovieId || String(m._id) === currentMovieId
  );

  if (!currentMovie) {
    console.error('Movie not found');
    return;
  }

  // 4. Pick the first genre (or any genre you want)
  const firstGenre = Array.isArray(currentMovie.genre) ? currentMovie.genre[0] : currentMovie.genre;

  // 5. Save it to window.lastGenre and render related movies
  window.lastGenre = firstGenre;
  renderMoviesByGenre(firstGenre);
});












document.addEventListener('DOMContentLoaded', initializeDetailsPage);