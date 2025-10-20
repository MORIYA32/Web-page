// Global variables
let allContent = [];
let userLikes = new Set();
let currentGenre = '';

// Get genre from URL
function getGenreFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('genre') || '';
}

// Fetch all content from API
async function fetchContent() {
    try {
        const response = await fetch('/api/content');
        if (!response.ok) throw new Error('Failed to fetch content');
        const data = await response.json();
        allContent = data;
        console.log('Content loaded:', allContent.length);
        return allContent;
    } catch (error) {
        console.error('Error fetching content:', error);
        return [];
    }
}

// Fetch unique genres for dropdown
async function fetchGenres() {
    const genresSet = new Set();
    allContent.forEach(item => {
        const genres = Array.isArray(item.genre) ? item.genre : [item.genre];
        genres.forEach(g => genresSet.add(g));
    });
    return Array.from(genresSet).sort();
}

// Populate genres dropdown
async function populateGenresDropdown() {
    const genres = await fetchGenres();
    const genresMenu = document.getElementById('genresMenu');
    const genresMenuMobile = document.getElementById('genresMenuMobile');
    
    if (!genresMenu || !genresMenuMobile) return;
    
    genresMenu.innerHTML = '';
    genresMenuMobile.innerHTML = '';
    
    genres.forEach(genre => {
        const li = document.createElement('li');
        li.innerHTML = `<a class="dropdown-item" href="genre.html?genre=${encodeURIComponent(genre)}">${genre}</a>`;
        genresMenu.appendChild(li);
        
        const liMobile = li.cloneNode(true);
        genresMenuMobile.appendChild(liMobile);
    });
}

// Save like counts to localStorage
function saveLikesToStorage(movieId, likes) {
    const likesData = JSON.parse(localStorage.getItem('movieLikes') || '{}');
    likesData[movieId] = likes;
    localStorage.setItem('movieLikes', JSON.stringify(likesData));
}

// Load like counts from localStorage
function loadLikesFromStorage() {
    const likesData = JSON.parse(localStorage.getItem('movieLikes') || '{}');
    return likesData;
}

// Save user-specific likes to localStorage
function saveUserLikesToStorage(userId, likedMovieIds) {
    const userLikesData = JSON.parse(localStorage.getItem('userLikes') || '{}');
    userLikesData[userId] = likedMovieIds;
    localStorage.setItem('userLikes', JSON.stringify(userLikesData));
}

// Load user-specific likes from localStorage
function loadUserLikesFromStorage(userId) {
    const userLikesData = JSON.parse(localStorage.getItem('userLikes') || '{}');
    return userLikesData[userId] || [];
}

// Load user likes from server
async function loadUserLikesFromServer(userId) {
    try {
        const response = await fetch(`/api/content/user-likes?userId=${userId}`);
        if (response.ok) {
            const likedIds = await response.json();
            userLikes = new Set(likedIds);
            saveUserLikesToStorage(userId, likedIds);
        }
    } catch (error) {
        console.error('Error loading user likes:', error);
        const storedLikes = loadUserLikesFromStorage(userId);
        userLikes = new Set(storedLikes);
    }
}

// GroupBy utility function
function groupBy(array, key) {
    return array.reduce((result, item) => {
        const values = Array.isArray(item[key]) ? item[key] : [item[key]];
        values.forEach(value => {
            if (!result[value]) {
                result[value] = [];
            }
            result[value].push(item);
        });
        return result;
    }, {});
}

// Filter content by genre
function filterByGenre(genre) {
    return allContent.filter(item => {
        const genres = Array.isArray(item.genre) ? item.genre : [item.genre];
        return genres.includes(genre);
    });
}

// Render genre content in carousels
function renderGenreContent() {
    const container = document.getElementById('categoriesContainer');
    const titleElement = document.getElementById('genreTitle');
    const pageTitle = document.getElementById('pageTitle');
    
    container.innerHTML = '';
    titleElement.textContent = currentGenre;
    pageTitle.textContent = `${currentGenre} - Netflix`;

    const genreContent = filterByGenre(currentGenre);

    if (genreContent.length === 0) {
        container.innerHTML = `<p style="color: white; text-align: center;">No content found for ${currentGenre}</p>`;
        return;
    }

    // Sort by popularity (likes)
    const sortedByPopularity = [...genreContent].sort((a, b) => b.likes - a.likes);

    // Create "Popular in [Genre]" category
    createCategory(`Popular in ${currentGenre}`, sortedByPopularity, container, 0);

    // Create "Top Picks for You" based on user's liked content
    if (userLikes.size > 0) {
        const likedGenres = new Set();
        allContent.forEach(item => {
            if (userLikes.has(item._id)) {
                const genres = Array.isArray(item.genre) ? item.genre : [item.genre];
                genres.forEach(g => likedGenres.add(g));
            }
        });

        const recommendations = genreContent.filter(item => {
            if (userLikes.has(item._id)) return false;
            const genres = Array.isArray(item.genre) ? item.genre : [item.genre];
            return genres.some(g => likedGenres.has(g));
        });

        if (recommendations.length > 0) {
            createCategory('Top Picks for You', recommendations, container, 1);
        }
    }
}

function createCategory(title, content, container, categoryIndex) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category-row';
    
    const titleEl = document.createElement('h3');
    titleEl.className = 'category-title';
    titleEl.textContent = title;
    categoryDiv.appendChild(titleEl);

    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel-container';

    const carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'carousel-wrapper';

    const track = document.createElement('div');
    track.className = 'carousel-track';
    track.id = `track-${categoryIndex}`;

    const originalLength = content.length;
    const contentToShow = content.length < 4 ? content : [...content, ...content];

    contentToShow.forEach(item => {
        track.appendChild(createMovieCard(item));
    });

    carouselWrapper.appendChild(track);
    carouselContainer.appendChild(carouselWrapper);

    const leftBtn = document.createElement('button');
    leftBtn.className = 'carousel-arrow left';
    leftBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    carouselContainer.appendChild(leftBtn);

    const rightBtn = document.createElement('button');
    rightBtn.className = 'carousel-arrow right';
    rightBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    carouselContainer.appendChild(rightBtn);

    categoryDiv.appendChild(carouselContainer);
    container.appendChild(categoryDiv);

    setupCarousel(categoryIndex, originalLength);
}

function setupCarousel(categoryIndex, originalLength) {
    const track = document.getElementById(`track-${categoryIndex}`);
    const leftBtn = track.parentElement.parentElement.querySelector('.left');
    const rightBtn = track.parentElement.parentElement.querySelector('.right');
    
    let currentIndex = 0;
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

        if (currentIndex >= originalLength) {
            setTimeout(() => {
                track.style.transition = 'none';
                currentIndex = 0;
                track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
                setTimeout(() => {
                    track.style.transition = 'transform 0.5s ease';
                }, 50);
            }, 500);
        }
    });

    leftBtn.addEventListener('click', () => {
        if (currentIndex === 0) {
            track.style.transition = 'none';
            currentIndex = originalLength;
            track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            setTimeout(() => {
                track.style.transition = 'transform 0.5s ease';
                currentIndex -= 4;
                track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            }, 50);
        } else {
            currentIndex -= 4;
            track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        }
    });
}

function createMovieCard(item) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => window.location.href = `details.html?id=${item.id}`;

    const storedLikes = loadLikesFromStorage();
    const currentLikes = storedLikes[item._id] !== undefined ? storedLikes[item._id] : item.likes;
    const userHasLiked = userLikes.has(item._id);

    const genres = Array.isArray(item.genre) ? item.genre.join(', ') : item.genre;

    card.innerHTML = `
        <div class="movie-poster">
            <img src="${item.thumbnail}" alt="${item.title}">
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${item.title}</h3>
            <div class="movie-details">
                <span>${item.year}</span>
                <span>•</span>
                <span>${item.type}</span>
            </div>
            <div class="movie-genre">${genres}</div>
            <button class="like-button ${userHasLiked ? 'liked' : ''}" 
                    data-movie-id="${item._id}">
                <i class="fas fa-heart heart-icon"></i>
                <span class="like-count">${currentLikes}</span>
            </button>
        </div>
    `;

    // Add click event to like button
    const likeBtn = card.querySelector('.like-button');
    likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLike(item._id);
    });

    return card;
}

// Toggle like functionality
async function toggleLike(movieId) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Please log in to like content');
        return;
    }

    const wasLiked = userLikes.has(movieId);

    try {
        const response = await fetch(`/api/content/${movieId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) throw new Error('Failed to update like');

        const data = await response.json();
        
        if (data.liked) {
            userLikes.add(movieId);
        } else {
            userLikes.delete(movieId);
        }

        saveLikesToStorage(movieId, data.likes);
        saveUserLikesToStorage(userId, Array.from(userLikes));
        updateLikeButton(movieId, data.likes, data.liked);

    } catch (error) {
        console.error('Error toggling like:', error);
        alert('Failed to update like. Please try again.');
    }
}

function updateLikeButton(movieId, likeCount, userHasLiked) {
    const buttons = document.querySelectorAll(`[data-movie-id="${movieId}"]`);

    buttons.forEach(button => {
        const heartIcon = button.querySelector('.heart-icon');

        // Update button appearance based on user's like status
        if (userHasLiked) {
            button.classList.add('liked');
            if (heartIcon) {
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
            }
        } else {
            button.classList.remove('liked');
            if (heartIcon) {
                heartIcon.classList.remove('fas');
                heartIcon.classList.add('far');
            }
        }

        // Update the button content to match feed.js style
        button.innerHTML = `<i class="heart-icon ${userHasLiked ? 'fas' : 'far'} fa-heart"></i> <span class="like-count">${likeCount}</span>`;

        // Add heart animation
        const newHeartIcon = button.querySelector('.heart-icon');
        if (newHeartIcon) {
            newHeartIcon.classList.add('heart-animation');

            setTimeout(() => {
                newHeartIcon.classList.remove('heart-animation');
            }, 600);
        }
    });
}
    });
}

// Search functionality
function toggleSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.classList.toggle('active');
    
    if (searchInput.classList.contains('active')) {
        searchInput.focus();
    } else {
        searchInput.value = '';
        hideSearchResults();
    }
}

function performSearch(query) {
    if (!query.trim()) {
        hideSearchResults();
        return;
    }

    const genreContent = filterByGenre(currentGenre);
    const results = genreContent.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(query.toLowerCase());
        const genres = Array.isArray(item.genre) ? item.genre : [item.genre];
        const genreMatch = genres.some(g => g.toLowerCase().includes(query.toLowerCase()));
        return titleMatch || genreMatch;
    });

    showSearchResults(query, results);
}

function showSearchResults(query, results) {
    const searchResults = document.getElementById('searchResults');
    const mainFeed = document.getElementById('mainFeed');
    const searchGrid = document.getElementById('searchGrid');
    const searchResultsTitle = document.getElementById('searchResultsTitle');

    searchResultsTitle.textContent = `Search results for "${query}" in ${currentGenre}`;
    searchGrid.innerHTML = '';

    if (results.length === 0) {
        searchGrid.innerHTML = '<p style="color: white; text-align: center; width: 100%;">No results found</p>';
    } else {
        results.forEach(item => {
            searchGrid.appendChild(createMovieCard(item));
        });
    }

    mainFeed.style.display = 'none';
    searchResults.style.display = 'block';
}

function hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    const mainFeed = document.getElementById('mainFeed');
    
    searchResults.style.display = 'none';
    mainFeed.style.display = 'block';
}

// Authentication check
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

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuthentication()) return;

    currentGenre = getGenreFromURL();
    if (!currentGenre) {
        window.location.href = 'feed.html';
        return;
    }

    updateProfileDropdown();

    const userId = localStorage.getItem('userId');
    await loadUserLikesFromServer(userId);
    await fetchContent();
    await populateGenresDropdown();
    renderGenreContent();

    // Search functionality
    const searchIcon = document.getElementById('searchIcon');
    const searchInput = document.getElementById('searchInput');

    searchIcon.addEventListener('click', (e) => {
        e.preventDefault();
        toggleSearch();
    });

    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    searchInput.addEventListener('blur', () => {
        if (!searchInput.value) {
            setTimeout(() => {
                searchInput.classList.remove('active');
                hideSearchResults();
            }, 200);
        }
    });

    // Sign out
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signOut();
        });
    }
});