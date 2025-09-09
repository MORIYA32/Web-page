// Dummy JSON data of shows

const moviesData = [
    {
        id: 1,
        title: "House",
        year: 2011,
        genre: "Medical, Drama",
        type: "Series",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABaQHOcdLduCCDQnC_Q9s6jcc_Yg50dw8wEd4jxy33FQrkfeRk1xDuBLg4QyOx0QDJAFMPhhh_32qkBaAOD9RDpY3x6BsUW9R5n4.webp?r=8eb"
    },
    {
        id: 2,
        title: "Love Is Blind",
        year: 2025,
        genre: "Romantic, Reality",
        type: "Series",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABdxIlxoppRCW0BN-_Bgj8o8poFsdrQCv2qjm_R8O52brppK99nKTT3U789ZhrQ2oEBo3xxqG7x8zUZI8LyPg2gQ5tmrggwWddgvE9wa7b_uEGo0DnR7JJX5Do8ahGyEJZJUh04AbD1lq5jlxB27sqBhIgXZCGA4F8ts9UJjfWPuUEdpsZabJVOewKXarudMp0Tgo46Ir02T09etCsUqNlUBHq-cF178v7NI.jpg?r=83d"
    },
    {
        id: 3,
        title: "Brooklyn Nine-Nine",
        year: 2021,
        genre: "Sitcom, Comedy, Crime",
        type: "Series",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABXswStJF6erS2MFeQovOiQpEioWFDoacFevkcDAz3i3zUrg_4-WEN3mljlIqseGqoo5hiL8w1ngOIyyM7SVrcmsYuWqnlZHSLoM.webp?r=c02"
    },
    {
        id: 4,
        title: "Gossip Girl",
        year: 2012,
        genre: "Drama, Teens",
        type: "Series",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABRSSySpczVbDRN7GtCwocOyxNDF4JjV-4g360CnQuRuWyU-KY-AE_iz18GdAtnA-25hq-6vkIfIbcz4E-q-CakrfT75HVl25xtM.webp?r=0f8"
    },
    {
        id: 5,
        title: "BoJack Horseman",
        year: 2020,
        genre: "Adult Animation, Sitcom, Comedy",
        type: "Series",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABcAQLVkzLmfrPzpdUS0kLseKTK13KJx6YWMYVZ8YP6iOPqTOcANJF9hvFyY1bkutBKMcrUIqrPbh5DHWKTPoc6ugD0bsbw0Iv-uuSzMxldE_pLi7jQgPirAJ62DbneNRA2-P.jpg?r=e20"
    },
    {
        id: 6,
        title: "Lucifer",
        year: 2021,
        genre: "Drama, Crime",
        type: "Series",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABSgixNYwX5NJ0R8A0fckxyhhB7BwU47ksY-5-MwBOz_4CyaNPsl6B8_3vjPCge3HqyWEjhIZ8VVihjg0E99da-c3WX8npPcFQTJPBqcDtSPssgqTxfe4NpQ4AFtGVwwX7qWr.jpg?r=1c3"
    },
    {
        id: 7,
        title: "Orange Is The New Black",
        year: 2019,
        genre: "Drama, Comedy",
        type: "Series",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABQnbVuaqnsAnKE3AhXOI0UZjrtGUVXfH5JqnHDBpmkdUTszTaKvyBPffs8Eh6m4arC1CsnBnfik-38A5BBjTCUVju-BWxcCJtWrbVPbuPQ_QHoFe8-Jb8oy-OWRLIt02g1b3.jpg?r=f1e"
    },
    {
        id: 8,
        title: "House of Cards",
        year: 2018,
        genre: "Political, Drama",
        type: "Series",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABf0rej3QuIII2RVsK9DkaY_8WjvPQ_-oUezv14Rn3H6DUR-DmtTq5qE8c3Cx7SuRzeGtf2iigC5dN9ABupPpM22lQRYrsbJTDQlfYf2wGTHITM_zZY8dV2SdYaPMm9Lnqfy0.jpg?r=c6b"
    },
    {
        id: 9,
        title: "Gilmore Girls",
        year: 2006,
        genre: "Romantic, Drama, Teens",
        type: "Series",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABePjVUmTO8X_TvfviqIQLx8ygidrtZM_h4Be9jrS8Agl0O9Az60cf1MZ9kpR9_MsuKKnjBwRYrxEZA3QjcPzKxlq6xXIIhcLDrA.webp?r=cf1"
    },
    {
        id: 10,
        title: "The Terminal",
        year: 2004,
        genre: "Romantic Comedy, Drama, Comedy",
        type: "Movie",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABZx0I09CYvyvoubjdi6C6AUIB1FDVO11ZqSareCV07p_dVO_6X4ULYY36BihuFUIYW9IDFIfmit70mt67RroKo8As2mCsnYWtts.webp?r=dcc"
    },
    {
        id: 11,
        title: "Big Mouth",
        year: 2025,
        genre: "Adult Animation, Sitcom",
        type: "Series",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABWDkHvVs2ltfdUcqKxbv_JjGtie3s64UdR2KDL_6NEcAktSXJ-p51nikN9RgyuMJAmkspUX97bxN7eecU3DnRxo9e296uwb_uR8PkTNjEqoeoAM89oa_lHC_3RrAOm_wn9c6E4ddREAJtjEKCI6EbdsX_xW4fKQOx6jO49fSroZIi9aIj9vGqmQqkLftXEhjVL5A9jAaw3X9UtLzzbvvuC_74DVEtNnxw04.jpg?r=d95"
    },
    {
        id: 12,
        title: "Too Hot To Handle",
        year: 2024,
        genre: "Reality",
        type: "Series",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABUObsJ5aV9p7OpAMQvlKMTfV_AHZW16-cKXZG8vIa8mFr2rE2a4gdioOmrPltLhs90M05CYNqLiTG3q3GQ5DtyEfePeUjp31NDhtx3hmqQD4QW7np3n-DD9jd0L31HqBbFrb.jpg?r=a70"
    },
    {
        id: 13,
        title: "Seinfeld",
        year: 1997,
        genre: "Sitcom, Comedy",
        type: "Series",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABek5Vfqnb2Q6LV1ricFCm6hwTIUx4lM8A0qChb3hBkXrzf0Aqnqm1W55M6-5rM75hGyuhgcjXJIthMkFN70ha85lQuu0AITsaJY.webp?r=a2d"
    },
    {
        id: 14,
        title: "Money Heist",
        year: 2021,
        genre: "Crime, Thriller",
        type: "Series",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABYQR8keX2salvT6mI4gP7R_0td2Ij-YQEerhrfNYEZ7YK1Y69R4h_vyB5oxyEIST4uvUw749SOsF2JXJ_kfR0mnSMW81hlOCxyl1RAjp6vbzZiESK010TylkUBM_hYb3s2fl.jpg?r=695"
    },
    {
        id: 15,
        title: "Rick And Morty",
        year: 2023,
        genre: "Adult Animation, Sitcom, Sci-fi",
        type: "Series",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABa5BCf6HoCBQCEQW5JNP301dwSPyJPEXbFicrHodTtnqA1AtzHfQyEfkHWQurDLPdc9Eq4LszcOs9gzzykJ3FvNwjhX2B7KLteY.webp?r=edf"
    },
    {
        id: 16,
        title: "Dead Poets Society",
        year: 1989,
        genre: "Classic, Drama",
        type: "Movie",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABV8sZMRBQJNC96ozW-VDffV_KoF8A9JWxa7TjOPKZ1PwBPPcgM5C1Bc_IEw43iZBKEIJ2hEGm_ojrmOPffhym0A6XOy9EjLpRFU.webp?r=166"
    },
    {
        id: 17,
        title: "Good Will Hunting",
        year: 1997,
        genre: "Classic, Drama",
        type: "Movie",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABe3v9snNZV3lusIELrCUksh4Ir4emffAouA4k6scI_hhaL534bKRKghYqIEEX21BNaEBoYzns5nLbQc71C5-fwdsUBQmCvKiBsghNrcmgiQLPrc8ZhDgwOkyMY5DeJRPNgrtPsF89Broy7Os8Dv2GUifu9OUqI2DFto.webp?r=b13"
    },
    {
        id: 18,
        title: "Mr. & Mrs. Smith",
        year: 2005,
        genre: "Romantic Comedy, Crime, Comedy",
        type: "Movie",
        likes: 0,
        poster: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABUFS_aJO9WRIF26ysUdwPyeUFykIj3dSyAq44cHdQAsAHCCM6ELjTw2uLcs5cqSYMIgH-MJgNTNglh8bc2fO_53aNdqr9wyCn7g.webp?r=f02"
    }
]

// Track user's activity (Likes and search)
let userLikes = {};
let isSearchActive = false;
let filteredMovies = [];

//LocalStorage for likes count
function saveLikesToStorage() {
    const likesData = {};
    moviesData.forEach(movie => {
        likesData[movie.id] = movie.likes;
    });
    localStorage.setItem('netflixLikes', JSON.stringify(likesData));
}

function loadLikesFromStorage() {
    const stored = localStorage.getItem('netflixLikes');
    if (stored) {
        const likesData = JSON.parse(stored);
        moviesData.forEach(movie => {
            if (likesData[movie.id] !== undefined) {
                movie.likes = likesData[movie.id];
            }
        });
    }
}

function saveUserLikesToStorage() {
    localStorage.setItem('netflixUserLikes', JSON.stringify(userLikes));
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

        const userHasLiked = userLikes[movie.id] || false;

        movieCard.innerHTML = `
        <div class="movie-poster">
            <img src="${movie.poster}" alt="${movie.title} poster">
        </div>
        <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-details">${movie.year} • ${movie.type}</div>
            <div class="movie-genre">${movie.genre}</div>
            <button class="like-btn ${userHasLiked ? 'liked' : ''}" onclick="toggleLike(${movie.id})" data-movie-id="${movie.id}">
              <i class="heart-icon ${userHasLiked ? 'fas' : 'far'} fa-heart"></i>
              ${movie.likes} ${movie.likes === 1 ? 'like' : 'likes'}
            </button>
        </div>
        `;

        showsGrid.appendChild(movieCard);
    });
}

// Function to toggle like status
function toggleLike(movieId) {
    const movie = moviesData.find(m => m.id === movieId);
    if (movie) {
        const userHasLiked = userLikes[movieId] || false;

        if (userHasLiked) {
            //Unlike
            movie.likes = Math.max(0, movie.likes - 1);
            userLikes[movieId] = false;
        } else {
            //Like
            movie.likes++;
            userLikes[movieId] = true;
        }

        //Save to localStorage
        saveLikesToStorage();
        saveUserLikesToStorage();

        //Update the button immediately
        updateLikeButton(movieId, movie.likes, userLikes[movieId]);
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
        return movie.title.toLowerCase().includes(query.toLowerCase()) ||
            movie.genre.toLowerCase().includes(query.toLowerCase()) ||
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

        const userHasLiked = userLikes[movie.id] || false;

        movieCard.innerHTML = `
        <div class="movie-poster">
            <img src="${movie.poster}" alt="${movie.title} poster">
        </div>
        <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-details">${movie.year} • ${movie.type}</div>
            <div class="movie-genre">${movie.genre}</div>
            <button class="like-btn ${userHasLiked ? 'liked' : ''}" onclick="toggleLike(${movie.id})" data-movie-id="${movie.id}">
              <i class="heart-icon ${userHasLiked ? 'fas' : 'far'} fa-heart"></i>
              ${movie.likes} ${movie.likes === 1 ? 'like' : 'likes'}
            </button>
        </div>
        `;

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

        const userHasLiked = userLikes[movie.id] || false;

        movieCard.innerHTML = `
        <div class="movie-poster">
            <img src="${movie.poster}" alt="${movie.title} poster">
        </div>
        <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-details">${movie.year} • ${movie.type}</div>
            <div class="movie-genre">${movie.genre}</div>
            <button class="like-btn ${userHasLiked ? 'liked' : ''} onclick="toggleLike(${movie.id})" data-movie-id="${movie.id}">
                <i class="heart-icon ${userHasLiked ? 'fas' : 'far'} fa-heart"></i>
                ${movie.likes} ${movie.likes === 1 ? 'like' : 'likes'}
            </button>
        </div>
        `;

        showsGrid.appendChild(movieCard);
    });
}

//Authentication and profile management
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
    localStorage.removeItem("selectedProfileId");
    localStorage.removeItem("selectedProfileName");
    localStorage.removeItem("selectedProfileAvatar");
    localStorage.removeItem("netflixLikes");
    localStorage.removeItem("netflixUserLikes");
    window.location.href = "./login.html"
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    if (!checkAuthentication()) {
        return;
    }

    updateWelcomeMessage();
    updateProfileDropdown();
    loadLikesFromStorage();
    loadUserLikesFromStorage();
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
    const signOutBtn = document.querySelector('.nav-sign-out');
    if (signOutBtn && signOutBtn.textContent.includes('Sign out of Netflix')) {
        signOutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            signOut();
        });
    }

    // Sign out button functionality
    const signOutLinks = document.querySelectorAll(".nav-sign-out");
    signOutLinks.forEach(link => {
        if (link.textContent.includes("Sign out")) {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                signOut();
            });
        }
    });

});