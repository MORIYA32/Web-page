const VIDEO_CURRENT_TIME_UPDATE_INTERVAL = 5000; 
const OPEN_EPISODES_ON_START = false;

const userId = localStorage.getItem("userId");

const urlParams = new URLSearchParams(window.location.search);
const initialContentId = urlParams.get('id');
const isTrailer = urlParams.get('trailer') === 'true';

let currentContent = null;
let currentSeason  = parseInt(urlParams.get('season'), 10) || 1;
let currentEpisode = parseInt(urlParams.get('episode'), 10) || 1;
let currentTimeInterval = null;

function fmtTime(t){
  if (!Number.isFinite(t)) return '00:00';
  const s = Math.floor(t % 60).toString().padStart(2,'0');
  const m = Math.floor((t/60)%60).toString().padStart(2,'0');
  const h = Math.floor(t/3600);
  return h>0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

/* make sure native controls are fully disabled */
function killNativeControlsHard() {
  const v = document.getElementById('videoPlayer');
  if (!v) return;
  v.controls = false;
  v.removeAttribute('controls');
  v.setAttribute('controls', 'false');
  v.setAttribute('playsinline', '');
  v.setAttribute('disablepictureinpicture', '');
  v.setAttribute('controlslist', 'nodownload noplaybackrate nofullscreen noremoteplayback');
}

function ensureNoNativeControls() {
  const v = document.getElementById('videoPlayer');
  if (!v) return;
  v.controls = false;
  v.removeAttribute('controls');
  killNativeControlsHard();
}

/* ========= auth ========= */
function checkAuthentication() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    window.location.href = './login.html';
    return false;
  }
  return true;
}

/* ========= api: content ========= */
async function fetchContentDetails(id) {
  try {
    const response = await fetch(`/api/content`);
    if (!response.ok) throw new Error('Failed to fetch content');
    const allContent = await response.json();
    return allContent.find(item => item.id == id);
  } catch (error) {
    console.error('Error fetching content:', error);
    return null;
  }
}

/* ========= video load ========= */
function loadVideo(videoUrl, startTime = 0) {
  const videoPlayer = document.getElementById('videoPlayer');
  if (!videoPlayer) return;

  ensureNoNativeControls();
  videoPlayer.src = videoUrl || '';
  videoPlayer.currentTime = startTime || 0;

  videoPlayer.oncanplay = () => {
    ensureNoNativeControls();
    videoPlayer.play().catch(()=>{ /* silent */ });
  };
}

function updateEpisodeInfo() {
  const titleElement = document.getElementById('contentTitle');
  const detailsElement = document.getElementById('episodeDetails');
  if (!currentContent) return;

  if (currentContent.type === 'series') {
    const season = currentContent.seasons?.find(s => s.seasonNumber === currentSeason);
    const episode = season?.episodes?.find(e => e.episodeNumber === currentEpisode);
    titleElement.textContent = currentContent.title || '';
    detailsElement.textContent = `Season ${currentSeason} Episode ${currentEpisode}${episode?.episodeTitle ? ': ' + episode.episodeTitle : ''}`;
  } else {
    // movie
    titleElement.textContent = currentContent.title || '';
    const genres = Array.isArray(currentContent.genre) ? currentContent.genre
                  : (Array.isArray(currentContent.genres) ? currentContent.genres : []);
    detailsElement.textContent = `${currentContent.year ?? ''}${genres.length ? ' • ' + genres.join(', ') : ''}`;
  }
}


function updateNavigationButtons() {
  const chipPrev    = document.getElementById('btnPrevEpisode');
  const chipNext    = document.getElementById('btnNextEpisode');
  const btnEpisodes = document.getElementById('btnEpisodes');

  [chipPrev, chipNext, btnEpisodes].forEach(el => {
    if (!el) return;
    el.style.display = '';           
    el.disabled = false;
    el.classList.remove('disabled');
    el.removeAttribute('aria-disabled');
  });

  const hasChapters = Array.isArray(currentContent?.chapters) && currentContent.chapters.length > 0;

  const shouldHaveEpisodes =
    !isTrailer && (
      currentContent?.type === 'series' ||
      (currentContent?.type === 'movie' && hasChapters)
    );

  if (btnEpisodes) {
    const label = (currentContent?.type === 'movie') ? 'Chapters' : 'Episodes';
    btnEpisodes.title = label;
    btnEpisodes.setAttribute('aria-label', label);
    btnEpisodes.disabled = !shouldHaveEpisodes;
    btnEpisodes.classList.toggle('disabled', !shouldHaveEpisodes);
    btnEpisodes.setAttribute('aria-disabled', String(!shouldHaveEpisodes));
  }

  const isSeries = currentContent?.type === 'series' && !isTrailer;

  if (chipPrev) chipPrev.style.visibility = isSeries ? 'visible' : 'hidden';
  if (chipNext) chipNext.style.visibility = isSeries ? 'visible' : 'hidden';

  if (isSeries) {
    const seasonData = currentContent.seasons?.find(s => s.seasonNumber === currentSeason);
    const hasNext =
      (seasonData && currentEpisode < (seasonData.episodes?.length || 0)) ||
      (currentSeason < (currentContent.seasons?.length || 0));
    const hasPrev = (currentEpisode > 1) || (currentSeason > 1);

    if (chipPrev) {
      chipPrev.disabled = !hasPrev;
      chipPrev.classList.toggle('disabled', !hasPrev);
      chipPrev.setAttribute('aria-disabled', String(!hasPrev));
    }

    if (chipNext) {
      chipNext.disabled = !hasNext;
      chipNext.classList.toggle('disabled', !hasNext);
      chipNext.setAttribute('aria-disabled', String(!hasNext));
      chipNext.title = hasNext ? 'Next Episode' : 'No next episode';
    }
  }
}

function playNextEpisode() {
  if (!currentContent || currentContent.type !== 'series') return;
  const seasonData = currentContent.seasons.find(s => s.seasonNumber === currentSeason);
  if (currentEpisode < seasonData.episodes.length) {
    currentEpisode++;
  } else if (currentSeason < currentContent.seasons.length) {
    currentSeason++;
    currentEpisode = 1;
  } else {
    return;
  }
  loadEpisode(0); // CHG: always start next episode from beginning
}

function playPreviousEpisode() {
  if (!currentContent || currentContent.type !== 'series') return;
  if (currentEpisode > 1) {
    currentEpisode--;
  } else if (currentSeason > 1) {
    currentSeason--;
    const prevSeasonData = currentContent.seasons.find(s => s.seasonNumber === currentSeason);
    currentEpisode = prevSeasonData.episodes.length;
  } else {
    return;
  }
  loadEpisode(0); // CHG: always start previous episode from beginning
}

async function saveCurrentTime() {
  const videoPlayer = document.getElementById('videoPlayer');
  if (!videoPlayer || !currentContent) return;
  const currentTime = videoPlayer.currentTime;

  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        contentId: currentContent.id,
        season: currentSeason,
        episode: currentEpisode,
        currentTime
      })
    });
  } catch (e) {
  }
}

async function getCurrentProgress() {
  if (!currentContent) return 0;
  try {
    const res = await fetch(`/api/progress?userId=${encodeURIComponent(userId)}&contentId=${encodeURIComponent(currentContent.id)}&season=${currentSeason}&episode=${currentEpisode}`);
    if (res.ok) {
      const data = await res.json();
      return data.currentTime || 0;
    }
  } catch (err) {
    console.error('Error fetching progress:', err);
  }
  return 0;
}

async function loadEpisode(startTimeOverride) {
  clearInterval(currentTimeInterval); // ok to keep (no interval will be set further)

  const startTime =
    (startTimeOverride !== undefined)
      ? startTimeOverride
      : await getCurrentProgress();

  let videoUrl = '';
  if (isTrailer) {
    videoUrl = currentContent.trailerUrl;
  } else if (currentContent.type === 'movie') {
    videoUrl = currentContent.videoUrl;
  } else if (currentContent.type === 'series') {
    const season  = currentContent.seasons.find(s => s.seasonNumber === currentSeason);
    const episode = season.episodes.find(s => s.episodeNumber === currentEpisode);
    videoUrl = episode.videoUrl;
    currentSeason  = season.seasonNumber;
    currentEpisode = episode.episodeNumber;
  }

  loadVideo(videoUrl, startTime || 0);
  updateEpisodeInfo();
  updateNavigationButtons();
  wireControlBarPlayback();

  if (OPEN_EPISODES_ON_START && !window.__openedDrawerOnce) {
    const hasChapters = Array.isArray(currentContent?.chapters) && currentContent.chapters.length > 0;
    const shouldOpen = !isTrailer && (currentContent?.type === 'series' || (currentContent?.type === 'movie' && hasChapters));
    if (shouldOpen) {
      openEpisodesDrawer();
      window.__openedDrawerOnce = true;
    }
  }

  // CHG: אין יותר שמירה אוטומטית כל X שניות
  // currentTimeInterval = setInterval(saveCurrentTime, VIDEO_CURRENT_TIME_UPDATE_INTERVAL);
}

function wireControlBarPlayback() {
  const v  = document.getElementById('videoPlayer');
  const btnPlayPause  = document.getElementById('btnPlayPause');
  const iconPlayPause = btnPlayPause?.querySelector('i');
  const btnBack10     = document.getElementById('btnBack10');
  const btnForward10  = document.getElementById('btnForward10');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const btnEpisodes   = document.getElementById('btnEpisodes');
  const btnPrevEp     = document.getElementById('btnPrevEpisode');
  const btnNextEp     = document.getElementById('btnNextEpisode');
  const seek          = document.getElementById('seek');
  const timeCur       = document.getElementById('timeCurrent');
  const timeTot       = document.getElementById('timeTotal');

  ensureNoNativeControls();

  const hasChapters = Array.isArray(currentContent?.chapters) && currentContent.chapters.length > 0;
  if (btnEpisodes) {
    const shouldHave = !isTrailer && (currentContent?.type === 'series' || (currentContent?.type === 'movie' && hasChapters));
    const label = (currentContent?.type === 'movie') ? 'Chapters' : 'Episodes';
    btnEpisodes.style.display = ''; 
    btnEpisodes.title = label;
    btnEpisodes.setAttribute('aria-label', label);
    btnEpisodes.disabled = !shouldHave;
    btnEpisodes.classList.toggle('disabled', !shouldHave);
    btnEpisodes.setAttribute('aria-disabled', String(!shouldHave));
  }

  if (btnPlayPause) btnPlayPause.onclick = () => { if (!v) return; v.paused ? v.play() : v.pause(); };
  if (v) {
    v.onplay  = () => { if (iconPlayPause) { iconPlayPause.className = 'fas fa-pause'; btnPlayPause?.setAttribute('aria-label','Pause'); } };
    v.onpause = () => { if (iconPlayPause) { iconPlayPause.className = 'fas fa-play';  btnPlayPause?.setAttribute('aria-label','Play');  } };
  }

  // CHG: שמירה רק בעת Pause, פעם אחת (ללא הצטברות מאזינים)
  if (v && !v.__saveOnPauseBound) {
    v.addEventListener('pause', saveCurrentTime);
    v.__saveOnPauseBound = true;
  }

  if (btnBack10)    btnBack10.onclick    = () => { if (!v) return; v.currentTime = Math.max(0, (v.currentTime || 0) - 10); };
  if (btnForward10) btnForward10.onclick = () => { if (!v) return; const d = v.duration || 0; v.currentTime = Math.min(d, (v.currentTime || 0) + 10); };

  if (seek) {
    seek.oninput = () => {
      if (!v || !Number.isFinite(v.duration)) return;
      v.currentTime = (Number(seek.value) / 100) * v.duration;
      seek.style.setProperty('--seek', `${seek.value}%`);
    };
  }

  if (btnFullscreen) {
    btnFullscreen.onclick = () => {
      const wrapper = document.getElementById('video-wrapper') || v;
      const doc = document;
      const isFS = doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement || doc.mozFullScreenElement;
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

  if (btnEpisodes) btnEpisodes.onclick = openEpisodesDrawer;
  if (btnPrevEp)   btnPrevEp.onclick   = playPreviousEpisode;
  if (btnNextEp)   btnNextEp.onclick   = () => { if (!btnNextEp.disabled) playNextEpisode(); };

  function syncUI() {
    if (!v) return;
    const d = v.duration || 0;
    const c = v.currentTime || 0;
    const pct = d ? (c / d) * 100 : 0;
    if (seek) { seek.value = pct; seek.style.setProperty('--seek', `${pct}%`); }
    if (timeCur) timeCur.textContent = fmtTime(c);
    if (timeTot) timeTot.textContent = fmtTime(d);
  }

  if (v) {
    v.onloadedmetadata = syncUI;
    v.ontimeupdate     = syncUI;
  }
  syncUI();
}

/* ========= drawer ========= */
function openEpisodesDrawer() {
  const drawer     = document.getElementById('episodesDrawer');
  const backdrop   = document.getElementById('episodesBackdrop');
  const titleElm   = document.getElementById('drawerTitle');
  const seasonRow  = document.getElementById('seriesSeasonRow');
  const epsList    = document.getElementById('drawerEpisodesList');
  const chaptersEl = document.getElementById('drawerChaptersList');

  if (!currentContent) return;

  epsList.innerHTML = '';
  chaptersEl.innerHTML = '';
  chaptersEl.style.display = 'none';
  seasonRow.style.display = 'none';

  if (currentContent.type === 'series') {
    titleElm.textContent = 'Episodes';
    seasonRow.style.display = '';
    renderDrawerSeasons();
    renderDrawerEpisodes(currentSeason);
  } else if (currentContent.type === 'movie') {
    titleElm.textContent = 'Chapters';
    const hasChapters = Array.isArray(currentContent.chapters) && currentContent.chapters.length > 0;
    if (hasChapters) {
      chaptersEl.style.display = '';
      renderDrawerChapters();
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'episode-row';
      btn.textContent = 'Restart movie';
      btn.onclick = () => { closeEpisodesDrawer(); loadEpisode(0); };
      epsList.appendChild(btn);
    }
  }

  drawer.classList.add('open');
  backdrop.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.classList.add('drawer-open');
}

function closeEpisodesDrawer() {
  const drawer   = document.getElementById('episodesDrawer');
  const backdrop = document.getElementById('episodesBackdrop');
  drawer.classList.remove('open');
  backdrop.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('drawer-open');
}

function renderDrawerSeasons() {
  const drawerSeasonSelect = document.getElementById('drawerSeasonSelect');
  drawerSeasonSelect.innerHTML = '';
  const seasons = Array.isArray(currentContent.seasons) ? currentContent.seasons : [];
  seasons
    .slice()
    .sort((a,b)=>a.seasonNumber - b.seasonNumber)
    .forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.seasonNumber;
      opt.textContent = `Season ${s.seasonNumber}`;
      if (s.seasonNumber === currentSeason) opt.selected = true;
      drawerSeasonSelect.appendChild(opt);
    });

  drawerSeasonSelect.onchange = (e) => {
    const sn = Number(e.target.value);
    renderDrawerEpisodes(sn);
  };
}

function renderDrawerEpisodes(seasonNumber) {
  const drawerEpisodesList = document.getElementById('drawerEpisodesList');
  const season = (currentContent.seasons || []).find(s => s.seasonNumber == seasonNumber);
  drawerEpisodesList.innerHTML = '';
  if (!season) return;
  season.episodes
    .slice()
    .sort((a,b)=>a.episodeNumber - b.episodeNumber)
    .forEach(ep => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'episode-row' + (ep.episodeNumber === currentEpisode ? ' active' : '');
      btn.innerHTML = `<strong>Episode ${ep.episodeNumber}</strong> ${ep.episodeTitle ? '– ' + ep.episodeTitle : ''}`;
      btn.onclick = () => {
        currentSeason  = season.seasonNumber;
        currentEpisode = ep.episodeNumber;
        closeEpisodesDrawer();
        loadEpisode(0); // start selected episode from beginning
      };
      drawerEpisodesList.appendChild(btn);
    });
}

function renderDrawerChapters() {
  const chaptersEl = document.getElementById('drawerChaptersList');
  chaptersEl.innerHTML = '';
  const chapters = Array.isArray(currentContent.chapters) ? currentContent.chapters : [];
  chapters.forEach((ch, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'episode-row';
    const label = ch.title ? `Chapter ${idx+1} – ${ch.title}` : `Chapter ${idx+1}`;
    btn.textContent = label;
    btn.onclick = () => {
      closeEpisodesDrawer();
      const start = Number(ch.startSeconds || 0);
      loadEpisode(start);
    };
    chaptersEl.appendChild(btn);
  });
}

/* ========= init ========= */
async function initializePlayer() {
  if (!checkAuthentication()) return;
  if (!initialContentId) { window.location.href = './feed.html'; return; }

  currentContent = await fetchContentDetails(initialContentId);
  if (!currentContent) { alert('Content not found'); window.location.href = './feed.html'; return; }

  document.getElementById('backButton')?.addEventListener('click', () => window.location.href = './feed.html');
  document.getElementById('closeEpisodes')?.addEventListener('click', closeEpisodesDrawer);
  document.getElementById('episodesBackdrop')?.addEventListener('click', closeEpisodesDrawer);

  ensureNoNativeControls();
  await loadEpisode();
}

document.addEventListener('DOMContentLoaded', initializePlayer);

/* ========= force custom UI early & often ========= */
(function enforceCustomControls() {
  const v = document.getElementById('videoPlayer');
  if (!v) return;
  const force = () => ensureNoNativeControls();
  ['loadedmetadata','canplay','play','pause','timeupdate','enterpictureinpicture','webkitpresentationmodechanged','emptied']
    .forEach(ev => v.addEventListener(ev, force));
  force();
  setTimeout(force, 100);
  setTimeout(force, 400);
  setTimeout(force, 1000);
})();
