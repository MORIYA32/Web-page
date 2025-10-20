// Store movies data globally
let moviesData = [];

// Track user's activity (Likes and search)
let userLikes = {};
let isSearchActive = false;
let filteredMovies = [];

// Fetch content from backend
async function fetchContent() {
    try {
        const response = await fetch('/api/content');
        if (!response.ok) {
            throw new Error('Failed to fetch content');
        }
        const content = await response.json();
        moviesData = content;
        return content;
    } catch (error) {
        console.error('Error fetching content:', error);
        return [];
    }
}

//LocalStorage for likes count
function saveLikesToStorage() {
    const likesData = {};
    moviesData.forEach(movie => {
        likesData[movie._id] = movie.likes;
    });
    localStorage.setItem('netflixLikes', JSON.stringify(likesData));
}

function loadLikesFromStorage() {
    const stored = localStorage.getItem('netflixLikes');
    if (stored) {
        const likesData = JSON.parse(stored);
        moviesData.forEach(movie => {
            if (likesData[movie._id] !== undefined) {
                movie.likes = likesData[movie._id];
            }
        });
    }
}

function saveUserLikesToStorage() {
    localStorage.setItem('netflixUserLikes', JSON.stringify(userLikes));
}

// Fetch user's likes from server
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

function loadUserLikesFromStorage() {
    const stored = localStorage.getItem('netflixUserLikes');
    if (stored) {
        userLikes = JSON.parse(stored);
    }
}

//Render movies
function renderMovies() {
    const showsGrid = document.getElementById('showsGrid');
    showsGrid.innerHTML = '';

    moviesData.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';

        const userHasLiked = userLikes[movie._id] || false;
        const genreDisplay = Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre;

        movieCard.innerHTML = `
        <div class="movie-poster">
            <img src="${movie.thumbnail || movie.poster}" alt="${movie.title} poster">
        </div>
        <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-details">${movie.year} • ${movie.type}</div>
            <div class="movie-genre">${genreDisplay}</div>
            <button class="like-btn ${userHasLiked ? 'liked' : ''}" data-movie-id="${movie._id}">
              <i class="heart-icon ${userHasLiked ? 'fas' : 'far'} fa-heart"></i>
              ${movie.likes || 0} ${(movie.likes || 0) === 1 ? 'like' : 'likes'}
            </button>
        </div>
        `;
        
        // Add click event to card (but not on like button)
        movieCard.addEventListener('click', (e) => {
            if (!e.target.closest('.like-btn')) {
                window.location.href = `details.html?id=${movie.id}`;
            }
        });
        
        // Add click event to like button
        const likeBtn = movieCard.querySelector('.like-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(movie._id);
        });

        showsGrid.appendChild(movieCard);
    });
}

// Function to toggle like status
async function toggleLike(movieId) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.error('User ID not found');
        return;
    }
    
    const movie = moviesData.find(m => m._id === movieId);
    if (movie) {
        const userHasLiked = userLikes[movieId] || false;

        try {
            // Call API to update like
            const response = await fetch(`/api/content/${movieId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                throw new Error('Failed to update like');
            }

            const data = await response.json();

            // Update local data with response
            movie.likes = data.likes;
            userLikes[movieId] = data.userHasLiked;

            // Save to localStorage (for backup)
            saveLikesToStorage();
            saveUserLikesToStorage();

            // Update the button immediately
            updateLikeButton(movieId, movie.likes, userLikes[movieId]);
        } catch (error) {
            console.error('Error updating like:', error);
        }
    }
}

// Update a specific like button
function updateLikeButton(movieId, likeCount, userHasLiked) {
    // Find the button using the data attribute
    const button = document.querySelector(`[data-movie-id="${movieId}"]`);

    if (button) {
        const heartIcon = button.querySelector('.heart-icon');

        // Update button appearance based on user's like status
        if (userHasLiked) {
            button.classList.add('liked');
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
        } else {
            button.classList.remove('liked');
            heartIcon.classList.remove('fas');
            heartIcon.classList.add('far');
        }

        // Update the text content
        button.innerHTML = `<i class="heart-icon ${userHasLiked ? 'fas' : 'far'} fa-heart"></i> ${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`;

        // Add heart animation
        const newHeartIcon = button.querySelector('.heart-icon');
        newHeartIcon.classList.add('heart-animation');

        // Remove animation class after animation completes
        setTimeout(() => {
            newHeartIcon.classList.remove('heart-animation');
        }, 600);
    }
}

//Search functionality
function toggleSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.getElementById('searchIcon');

    if (!isSearchActive) {
        searchInput.classList.add('active');
        searchInput.focus();
        isSearchActive = true;
    } else {
        if (searchInput.value.trim() === '') {
            searchInput.classList.remove('active');
            isSearchActive = false;
            hideSearchResults();
        }
    }
}

function performSearch(query) {
    if (query.trim() === '') {
        hideSearchResults();
        return;
    }

    filteredMovies = moviesData.filter(movie => {
        const genreStr = Array.isArray(movie.genre) ? movie.genre.join(' ') : movie.genre;
        return movie.title.toLowerCase().includes(query.toLowerCase()) ||
            genreStr.toLowerCase().includes(query.toLowerCase()) ||
            movie.type.toLowerCase().includes(query.toLowerCase());
    });

    showSearchResults(query, filteredMovies);
}

function showSearchResults(query, results) {
    const trailerSection = document.querySelector('.trailer-section');
    const mainFeed = document.getElementById('mainFeed');
    const searchResults = document.getElementById('searchResults');
    const searchResultsTitle = document.getElementById('searchResultsTitle');
    const searchGrid = document.getElementById('searchGrid');

    // Hide trailer and main feed
    trailerSection.style.display = 'none';
    mainFeed.style.display = 'none';

    // Show search results
    searchResults.style.display = 'block';
    searchResultsTitle.textContent = `Search results for "${query}" (${results.length} ${results.length === 1 ? 'result' : 'results'})`;

    // Render search results
    searchGrid.innerHTML = '';

    if (results.length === 0) {
        searchGrid.innerHTML = '<div style="color: white; text-align: center; width: 100%; margin-top: 50px;">No results found</div>';
        return;
    }

    results.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';

        const userHasLiked = userLikes[movie._id] || false;
        const genreDisplay = Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre;

        movieCard.innerHTML = `
        <div class="movie-poster">
            <img src="${movie.thumbnail || movie.poster}" alt="${movie.title} poster">
        </div>
        <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-details">${movie.year} • ${movie.type}</div>
            <div class="movie-genre">${genreDisplay}</div>
            <button class="like-btn ${userHasLiked ? 'liked' : ''}" data-movie-id="${movie._id}">
              <i class="heart-icon ${userHasLiked ? 'fas' : 'far'} fa-heart"></i>
              ${movie.likes || 0} ${(movie.likes || 0) === 1 ? 'like' : 'likes'}
            </button>
        </div>
        `;
        
        // Add click event to card
        movieCard.addEventListener('click', (e) => {
            if (!e.target.closest('.like-btn')) {
                window.location.href = `details.html?id=${movie.id}`;
            }
        });
        
        // Add click event to like button
        const likeBtn = movieCard.querySelector('.like-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(movie._id);
        });

        searchGrid.appendChild(movieCard);
    });
}

function hideSearchResults() {
    const trailerSection = document.querySelector('.trailer-section');
    const mainFeed = document.getElementById('mainFeed');
    const searchResults = document.getElementById('searchResults');

    // Show trailer and main feed
    trailerSection.style.display = 'flex';
    mainFeed.style.display = 'block';

    // Hide search results
    searchResults.style.display = 'none';
}

// Sort functionality
function sortMovies(criteria) {
    let sortedMovies = [...moviesData];

    switch (criteria) {
        case 'year':
            sortedMovies.sort((a, b) => b.year - a.year);
            break;
        case 'az':
            sortedMovies.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
            break;
        case 'za':
            sortedMovies.sort((a, b) => b.title.localeCompare(a.title, undefined, { sensitivity: "base" }));
            break;
    }

    renderSortedMovies(sortedMovies);
}

function renderSortedMovies(movies) {
    const showsGrid = document.getElementById('showsGrid');
    showsGrid.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';

        const userHasLiked = userLikes[movie._id] || false;
        const genreDisplay = Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre;

        movieCard.innerHTML = `
        <div class="movie-poster">
            <img src="${movie.thumbnail || movie.poster}" alt="${movie.title} poster">
        </div>
        <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-details">${movie.year} • ${movie.type}</div>
            <div class="movie-genre">${genreDisplay}</div>
            <button class="like-btn ${userHasLiked ? 'liked' : ''}" data-movie-id="${movie._id}">
                <i class="heart-icon ${userHasLiked ? 'fas' : 'far'} fa-heart"></i>
                ${movie.likes || 0} ${(movie.likes || 0) === 1 ? 'like' : 'likes'}
            </button>
        </div>
        `;
        
        // Add click event to card
        movieCard.addEventListener('click', (e) => {
            if (!e.target.closest('.like-btn')) {
                window.location.href = `details.html?id=${movie.id}`;
            }
        });
        
        // Add click event to like button
        const likeBtn = movieCard.querySelector('.like-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(movie._id);
        });

        showsGrid.appendChild(movieCard);
    });
}

// Authentication and profile management
function checkAuthentication() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const selectedProfileName = localStorage.getItem("selectedProfileName");
    
    if (!isLoggedIn) {
        window.location.href = "./login.html";
        return false;
    }
    
    if (!selectedProfileName) {
        window.location.href = "./profiles.html";
        return false;
    }
    
    return true;
}

function updateWelcomeMessage() {
    const name = localStorage.getItem("selectedProfileName");
    const welcomeMessage = document.getElementById("welcome-message");
    if (welcomeMessage && name) {
        welcomeMessage.textContent = `Welcome, ${name}!`;
    }
}

function updateProfileDropdown() {
    const selectedAvatar = localStorage.getItem("selectedProfileAvatar");
    const profilePic = document.querySelector(".profile-pic");
    
    if (profilePic && selectedAvatar) {
        profilePic.src = selectedAvatar;
    }
}

function signOut() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("selectedProfileId");
    localStorage.removeItem("selectedProfileName"); 
    localStorage.removeItem("selectedProfileAvatar");
    localStorage.removeItem("netflixLikes");
    localStorage.removeItem("netflixUserLikes");
    window.location.href = "./login.html";
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function () {
    // Check authentication first
    if (!checkAuthentication()) {
        return;
    }
    
    // Initialize page content
    updateWelcomeMessage();
    updateProfileDropdown();
    
    // Fetch content from backend and render
    await fetchContent();
    
    // Load user likes from server
    await loadUserLikesFromServer();
    
    renderMovies();

    // Search event listeners
    const searchIcon = document.getElementById('searchIcon');
    const searchInput = document.getElementById('searchInput');

    searchIcon.addEventListener('click', function (e) {
        e.preventDefault();
        toggleSearch();
    });

    searchInput.addEventListener('input', function (e) {
        performSearch(e.target.value);
    });

    searchInput.addEventListener('blur', function (e) {
        // Small delay to allow clicking on results
        setTimeout(() => {
            if (e.target.value.trim() === '') {
                e.target.classList.remove('active');
                isSearchActive = false;
                hideSearchResults();
            }
        }, 200);
    });

    //Sort event listener
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.addEventListener('change', function (e) {
        sortMovies(e.target.value);
    });
    
    // Sign out event listener
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            signOut();
        });
    }
});