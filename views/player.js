const VIDEO_CURRENT_TIME_UPDATE_INTRERVAL = 5000

const userId = localStorage.getItem("userId");

const urlParams = new URLSearchParams(window.location.search);
const initialContentId = urlParams.get('id');
const isTrailer = urlParams.get('trailer') === 'true';

let currentContent = null;
let currentSeason = parseInt(urlParams.get('season'), 10) || 1;
let currentEpisode = parseInt(urlParams.get('episode'), 10) || 1;
let currentTimeInterval = null

function checkAuthentication() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = './login.html';
        return false;
    }
    return true;
}

async function fetchContentDetails(id) {
    try {
        const response = await fetch(`/api/content`);
        if (!response.ok) {
            throw new Error('Failed to fetch content');
        }
        const allContent = await response.json();
        return allContent.find(item => item.id == id);
    } catch (error) {
        console.error('Error fetching content:', error);
        return null;
    }
}

function loadVideo(videoUrl, startTime = 0) {
    document.getElementById('videoPlayer').remove();

    const videoWrapper = document.getElementById('video-wrapper');
    const videoPlayer = document.createElement('video')

    videoPlayer.id = "videoPlayer"
    videoPlayer.controls =  true;
    videoPlayer.src = videoUrl;
    videoPlayer.currentTime = startTime;

    videoWrapper.appendChild(videoPlayer)

    videoPlayer.oncanplay = (e) => {
        videoPlayer.play();
    }
}

function updateEpisodeInfo() {
    const titleElement = document.getElementById('contentTitle');
    const detailsElement = document.getElementById('episodeDetails');

    if (currentContent.type === 'series') {
        const season = currentContent.seasons.find(s => s.seasonNumber === currentSeason);
        const episode = season?.episodes.find(e => e.episodeNumber === currentEpisode);
        titleElement.textContent = currentContent.title;
        detailsElement.textContent = `Season ${currentSeason} Episode ${currentEpisode}${episode?.episodeTitle ? ': ' + episode.episodeTitle : ''}`;
    } else {
        titleElement.textContent = currentContent.title;
        detailsElement.textContent = `${currentContent.year} • ${currentContent.genre.join(', ')}`;
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevEpisode');
    const nextBtn = document.getElementById('nextEpisode');

    if (currentContent.type === 'series' && !isTrailer) {
        const currentSeasonData = currentContent.seasons.find(s => s.seasonNumber === currentSeason);
        const hasNextEpisode = currentEpisode < currentSeasonData?.episodes.length ||
                               currentSeason < currentContent.seasons.length;
        const hasPrevEpisode = currentEpisode > 1 || currentSeason > 1;

        prevBtn.style.display = hasPrevEpisode ? 'block' : 'none';
        nextBtn.style.display = hasNextEpisode ? 'block' : 'none';
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
}

function playNextEpisode() {
    const currentSeasonData = currentContent.seasons.find(s => s.seasonNumber === currentSeason);

    if (currentEpisode < currentSeasonData.episodes.length) {
        currentEpisode++;
    } else if (currentSeason < currentContent.seasons.length) {
        currentSeason++;
        currentEpisode = 1;
    }

    loadEpisode()
}

function playPreviousEpisode() {
    if (currentEpisode > 1) {
        currentEpisode--;
    } else if (currentSeason > 1) {
        currentSeason--;
        const prevSeasonData = currentContent.seasons.find(s => s.seasonNumber === currentSeason);
        currentEpisode = prevSeasonData.episodes.length;
    }

    loadEpisode()
}

async function saveCurrentTime() {
    const videoPlayer = document.getElementById('videoPlayer');

    const currentTime = videoPlayer.currentTime;

    await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            "contentId" : currentContent.id,
            "season" : currentSeason,
            "episode" : currentEpisode,
            currentTime
        })
    });
}

async function getCurrentProgress() {
    try {
        const res = await fetch(`/api/progress?userId=${userId}&contentId=${currentContent.id}&season=${currentSeason}&episode=${currentEpisode}`);
        if (res.ok) {
            const data = await res.json();
            return data.currentTime || 0;
        }
    } catch (err) {
        console.error('Error fetching progress:', err);
    }
    return 0;
}

async function loadEpisode() {
    clearInterval(currentTimeInterval)

    const startTime = await getCurrentProgress(currentContent.id);
    
    let videoUrl;
    if (isTrailer) {
        videoUrl = currentContent.trailerUrl;
    } else if (currentContent.type === 'movie') {
        videoUrl = currentContent.videoUrl;
    } else if (currentContent.type === 'series') {
        const season = currentContent.seasons.find(s => s.seasonNumber === currentSeason);
        const episode = season.episodes.find(s => s.episodeNumber === currentEpisode);
        videoUrl = episode.videoUrl;
        currentSeason = season.seasonNumber;
        currentEpisode = episode.episodeNumber;
    }

    loadVideo(videoUrl, startTime);
    updateEpisodeInfo();
    updateNavigationButtons();

    currentTimeInterval = setInterval(saveCurrentTime, VIDEO_CURRENT_TIME_UPDATE_INTRERVAL);
}

async function initializePlayer() {
    if (!checkAuthentication()) return;
    if (!initialContentId) {
        window.location.href = './feed.html';
        return;
    }

    currentContent = await fetchContentDetails(initialContentId);
    if (!currentContent) {
        alert('Content not found');
        window.location.href = './feed.html';
        return;
    }

   loadEpisode()

    // Event listeners
    document.getElementById('backButton').addEventListener('click', () => window.location.href = './feed.html');
    document.getElementById('nextEpisode').addEventListener('click', playNextEpisode);
    document.getElementById('prevEpisode').addEventListener('click', playPreviousEpisode);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializePlayer);
