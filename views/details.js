let currentContent = null;
let userLikes = {};

// Get content ID from URL
const urlParams = new URLSearchParams(window.location.search);
const contentId = urlParams.get('id');

// Check authentication
function checkAuthentication() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = './login.html';
        return false;
    }
    return true;
}

// Load user likes from storage
function loadUserLikesFromStorage() {
    const stored = localStorage.getItem('userLikes');
    if (stored) {
        userLikes = JSON.parse(stored);
    }
}

// Load user likes from server
async function loadUserLikesFromServer() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    try {
        const response = await fetch(`/api/content/user-likes?userId=${userId}`);
        if (response.ok) {
            const data = await response.json();
            userLikes = {};
            data.likedIds.forEach(id => {
                userLikes[id] = true;
            });
        }
    } catch (error) {
        console.error('Error loading user likes:', error);
    }
}

// Save user likes to storage
function saveUserLikesToStorage() {
    localStorage.setItem('userLikes', JSON.stringify(userLikes));
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

// Load trailer
function loadTrailer(trailerUrl) {
    const trailerPlayer = document.getElementById('trailerPlayer');
    const normalizedUrl = normalizeVideoPath(trailerUrl);
    trailerPlayer.src = normalizedUrl;
    trailerPlayer.load();
}

// Fetch Wikipedia URL for an actor
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
    } catch (error) {
        console.error(`Error fetching Wikipedia for ${actorName}:`, error);
    }
    return { url: null, image: null };
}


// Update content details
async function updateContentDetails() {
    document.getElementById('contentTitle').textContent = currentContent.title;
    document.getElementById('contentYear').textContent = currentContent.year;
    document.getElementById('contentType').textContent = currentContent.type === 'series' ? 'TV Series' : 'Movie';
    document.getElementById('contentGenre').textContent = currentContent.genre.join(', ');
    
    // Display actors with Wikipedia links
    const actorsContainer = document.getElementById('contentActors');
    actorsContainer.innerHTML = '';
    
    for (const actor of currentContent.actors) {
        const actorInfo = await fetchWikipediaActorInfo(actor);

        const actorDiv = document.createElement('div');
        actorDiv.className = 'actor-card';

        if (actorInfo.image) {
            const img = document.createElement('img');
            img.src = actorInfo.image;
            img.alt = actor;
            actorDiv.appendChild(img);
        } else {
            // No image - create a gray circle placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'actor-placeholder';
            actorDiv.appendChild(placeholder);
        }

        if (actorInfo.url) {
            const link = document.createElement('a');
            link.href = actorInfo.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = actor;
            actorDiv.appendChild(link);
        } else {
            const span = document.createElement('span');
            span.textContent = actor;
            actorDiv.appendChild(span);
        }

        actorsContainer.appendChild(actorDiv);
    }



    
    document.getElementById('contentDescription').textContent = currentContent.description || "No description available.";

    // Update like button
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

// Fetch and display ratings
async function fetchAndDisplayRatings() {
    if (!currentContent._id) return;
    
    try {
        const response = await fetch(`/api/content/${currentContent._id}/ratings`);
        if (!response.ok) {
            throw new Error('Failed to fetch ratings');
        }
        
        const data = await response.json();
        
        if (data.ratings) {
            const ratingsSection = document.getElementById('ratingsSection');
            const imdbRating = document.getElementById('imdbRating');
            const rtRating = document.getElementById('rtRating');
            
            let hasRatings = false;
            
            if (data.ratings.imdb) {
                imdbRating.querySelector('.rating-value').textContent = data.ratings.imdb;
                imdbRating.style.display = 'flex';
                hasRatings = true;
            }
            
            if (data.ratings.rottenTomatoes) {
                rtRating.querySelector('.rating-value').textContent = data.ratings.rottenTomatoes;
                rtRating.style.display = 'flex';
                hasRatings = true;
            }
            
            if (hasRatings) {
                ratingsSection.style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('Error fetching ratings:', error);
    }
}

// Display episodes for series
function displayEpisodes() {
    if (currentContent.type !== 'series') {
        return;
    }
    
    const episodesSection = document.getElementById('episodesSection');
    const seasonSelect = document.getElementById('seasonSelect');
    const episodesList = document.getElementById('episodesList');
    
    episodesSection.style.display = 'block';
    
    // Populate season selector
    seasonSelect.innerHTML = '';
    currentContent.seasons.forEach(season => {
        const option = document.createElement('option');
        option.value = season.seasonNumber;
        option.textContent = `Season ${season.seasonNumber}`;
        seasonSelect.appendChild(option);
    });
    
    // Display episodes for selected season
    function displaySeasonEpisodes(seasonNumber) {
        const season = currentContent.seasons.find(s => s.seasonNumber == seasonNumber);
        episodesList.innerHTML = '';
        
        season.episodes.forEach(episode => {
            const episodeCard = document.createElement('div');
            episodeCard.className = 'episode-card';
            episodeCard.innerHTML = `
                <h4>Episode ${episode.episodeNumber}</h4>
                <p>${episode.episodeTitle || ''}</p>
            `;
            
            episodeCard.addEventListener('click', () => {
                window.location.href = `player.html?id=${currentContent.id}&season=${seasonNumber}&episode=${episode.episodeNumber}`;
            });
            
            episodesList.appendChild(episodeCard);
        });
    }
    
    seasonSelect.addEventListener('change', (e) => {
        displaySeasonEpisodes(e.target.value);
    });
    
    // Display first season by default
    displaySeasonEpisodes(currentContent.seasons[0].seasonNumber);
}

// Toggle like
async function toggleLike() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.error('User ID not found');
        return;
    }
    
    const likeButton = document.getElementById('likeButton');
    const userHasLiked = userLikes[currentContent._id] === true;
    
    try {
        const response = await fetch(`/api/content/${currentContent._id}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update like');
        }
        
        const data = await response.json();
        
        // Update local state with server response
        userLikes[currentContent._id] = data.userHasLiked;
        saveUserLikesToStorage();
        
        // Update UI
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

// Initialize details page
async function initializeDetailsPage() {
    if (!checkAuthentication()) {
        return;
    }
    
    if (!contentId) {
        window.location.href = './feed.html';
        return;
    }
    
    // Load user likes from server
    await loadUserLikesFromServer();
    
    currentContent = await fetchContentDetails(contentId);
    
    if (!currentContent) {
        alert('Content not found');
        window.location.href = './feed.html';
        return;
    }
    
    loadTrailer(currentContent.trailerUrl);
    updateContentDetails();
    fetchAndDisplayRatings();
    displayEpisodes();
    
    // Event listeners
    document.getElementById('backButton').addEventListener('click', () => {
        window.location.href = './feed.html';
    });
    
    document.getElementById('playButton').addEventListener('click', () => {
        window.location.href = `player.html?id=${currentContent.id}`;
    });
    
    document.getElementById('likeButton').addEventListener('click', toggleLike);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeDetailsPage);
