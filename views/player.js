let currentContent = null;
let currentSeason = 1;
let currentEpisode = 1;

// Get content ID and type from URL
const urlParams = new URLSearchParams(window.location.search);
const contentId = urlParams.get('id');
const isTrailer = urlParams.get('trailer') === 'true';

// Check authentication
function checkAuthentication() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = './login.html';
        return false;
    }
    return true;
}

// Fetch content details
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

// Convert backslashes to forward slashes for web URLs
function normalizeVideoPath(path) {
    if (!path) return '';
    return '/' + path.replace(/\\/g, '/');
}

// Load video
function loadVideo(videoUrl) {
    const videoPlayer = document.getElementById('videoPlayer');
    const normalizedUrl = normalizeVideoPath(videoUrl);
    videoPlayer.src = normalizedUrl;
    videoPlayer.load();
}

// Update episode info
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

// Update navigation buttons
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

// Play next episode
function playNextEpisode() {
    const currentSeasonData = currentContent.seasons.find(s => s.seasonNumber === currentSeason);
    
    if (currentEpisode < currentSeasonData.episodes.length) {
        currentEpisode++;
    } else if (currentSeason < currentContent.seasons.length) {
        currentSeason++;
        currentEpisode = 1;
    } else {
        return; // No more episodes
    }
    
    const season = currentContent.seasons.find(s => s.seasonNumber === currentSeason);
    const episode = season.episodes.find(e => e.episodeNumber === currentEpisode);
    
    loadVideo(episode.videoUrl);
    updateEpisodeInfo();
    updateNavigationButtons();
}

// Play previous episode
function playPreviousEpisode() {
    if (currentEpisode > 1) {
        currentEpisode--;
    } else if (currentSeason > 1) {
        currentSeason--;
        const prevSeasonData = currentContent.seasons.find(s => s.seasonNumber === currentSeason);
        currentEpisode = prevSeasonData.episodes.length;
    } else {
        return; // No previous episodes
    }
    
    const season = currentContent.seasons.find(s => s.seasonNumber === currentSeason);
    const episode = season.episodes.find(e => e.episodeNumber === currentEpisode);
    
    loadVideo(episode.videoUrl);
    updateEpisodeInfo();
    updateNavigationButtons();
}

// Initialize player
async function initializePlayer() {
    if (!checkAuthentication()) {
        return;
    }
    
    if (!contentId) {
        window.location.href = './feed.html';
        return;
    }
    
    currentContent = await fetchContentDetails(contentId);
    
    if (!currentContent) {
        alert('Content not found');
        window.location.href = './feed.html';
        return;
    }
    
    let videoUrl;
    
    if (isTrailer) {
        videoUrl = currentContent.trailerUrl;
    } else if (currentContent.type === 'movie') {
        videoUrl = currentContent.videoUrl;
    } else if (currentContent.type === 'series') {
        const season = currentContent.seasons[0];
        const episode = season.episodes[0];
        videoUrl = episode.videoUrl;
        currentSeason = season.seasonNumber;
        currentEpisode = episode.episodeNumber;
    }
    
    loadVideo(videoUrl);
    updateEpisodeInfo();
    updateNavigationButtons();
    
    // Event listeners
    document.getElementById('backButton').addEventListener('click', () => {
        window.location.href = './feed.html';
    });
    
    document.getElementById('nextEpisode').addEventListener('click', playNextEpisode);
    document.getElementById('prevEpisode').addEventListener('click', playPreviousEpisode);
    
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializePlayer);
