// Check if user is logged in
if (!localStorage.getItem('isLoggedIn')) {
  window.location.href = './login.html';
}

// Update Email Form
const updateEmailForm = document.getElementById('updateEmailForm');
const newEmailInput = document.getElementById('newEmail');
const emailError = document.getElementById('emailError');

// Clear email field on blur if invalid
newEmailInput.addEventListener('blur', () => {
  const email = newEmailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    emailError.textContent = 'Please enter a valid email address';
    newEmailInput.classList.add('error');
  }
});

// Clear error on focus
newEmailInput.addEventListener('focus', () => {
  emailError.textContent = '';
  newEmailInput.classList.remove('error');
});

updateEmailForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  emailError.textContent = '';
  newEmailInput.classList.remove('error');
  
  const email = newEmailInput.value.trim();
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    emailError.textContent = 'Please enter a valid email address';
    newEmailInput.classList.add('error');
    return;
  }
  
  // TODO: Add Ajax call to update email on server
  alert('Email updated successfully! (Ajax implementation pending)');
  newEmailInput.value = '';
});

// Update Password Form
const updatePasswordForm = document.getElementById('updatePasswordForm');
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const currentPasswordError = document.getElementById('currentPasswordError');
const newPasswordError = document.getElementById('newPasswordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');

// Clear error on focus for all password fields
[currentPasswordInput, newPasswordInput, confirmPasswordInput].forEach(input => {
  input.addEventListener('focus', () => {
    currentPasswordError.textContent = '';
    newPasswordError.textContent = '';
    confirmPasswordError.textContent = '';
    currentPasswordInput.classList.remove('error');
    newPasswordInput.classList.remove('error');
    confirmPasswordInput.classList.remove('error');
  });
});

// Validate on blur
newPasswordInput.addEventListener('blur', () => {
  const newPwd = newPasswordInput.value.trim();
  if (newPwd && newPwd.length < 8) {
    newPasswordError.textContent = 'Password must be at least 8 characters';
    newPasswordInput.classList.add('error');
  } else if (newPwd && currentPasswordInput.value.trim() && newPwd === currentPasswordInput.value.trim()) {
    newPasswordError.textContent = 'New password must be different from current password';
    newPasswordInput.classList.add('error');
  }
});

confirmPasswordInput.addEventListener('blur', () => {
  const confirmPwd = confirmPasswordInput.value.trim();
  const newPwd = newPasswordInput.value.trim();
  if (confirmPwd && newPwd && confirmPwd !== newPwd) {
    confirmPasswordError.textContent = 'Passwords do not match';
    confirmPasswordInput.classList.add('error');
  }
});

updatePasswordForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Clear errors
  currentPasswordError.textContent = '';
  newPasswordError.textContent = '';
  confirmPasswordError.textContent = '';
  currentPasswordInput.classList.remove('error');
  newPasswordInput.classList.remove('error');
  confirmPasswordInput.classList.remove('error');
  
  let isValid = true;
  
  // Validate current password
  if (currentPasswordInput.value.trim().length < 8) {
    currentPasswordError.textContent = 'Password must be at least 8 characters';
    currentPasswordInput.classList.add('error');
    isValid = false;
  }
  
  // Validate new password length
  if (newPasswordInput.value.trim().length < 8) {
    newPasswordError.textContent = 'Password must be at least 8 characters';
    newPasswordInput.classList.add('error');
    isValid = false;
  }
  
  // Validate new password is different from current
  if (newPasswordInput.value.trim() === currentPasswordInput.value.trim()) {
    newPasswordError.textContent = 'New password must be different from current password';
    newPasswordInput.classList.add('error');
    isValid = false;
  }
  
  // Validate confirm password
  if (newPasswordInput.value !== confirmPasswordInput.value) {
    confirmPasswordError.textContent = 'Passwords do not match';
    confirmPasswordInput.classList.add('error');
    isValid = false;
  }
  
  if (!isValid) return;
  
  // TODO: Add Ajax call to update password on server
  alert('Password updated successfully! (Ajax implementation pending)');
  currentPasswordInput.value = '';
  newPasswordInput.value = '';
  confirmPasswordInput.value = '';
});

// Create Profile Form
const createProfileForm = document.getElementById('createProfileForm');
const profileNameInput = document.getElementById('profileName');
const profileAvatarInput = document.getElementById('profileAvatar');
const profileNameError = document.getElementById('profileNameError');
const profileAvatarError = document.getElementById('profileAvatarError');

// Avatar gallery
const avatarGallery = document.getElementById('avatarGallery');
const avatarOptions = [
  "https://occ-0-2616-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABaKhq8_koRe36dg_ZIzZtoo4GJjIIBVe6WQ9cHsmOWj-yahykBnxcMsnRyqBG_E81wVhsxv-KSIM0xH8qUXTS8YKC8LczDYl8Q.png?r=558",
  "https://occ-0-2616-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABbBdWEzsqtpcYRfW0oClQ8jdJx6uHK5oNiHQPNZrUhrT5-2gizvuV0zRpgYoXI-hS7JqdZ1Q_mCWUUWlaNx4pHv1c__GSpT8Gg.png?r=cad",
  "https://occ-0-2616-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABQ1daRTyjb8NMzXFgw_IWDY2xSnzZQlabeQypg29Jrwl6bptBj3NFb3O5mn-xGtljuYRwsKb9Ef3GrWAAyUedjWIWtyIkYg1eQ.png?r=a16",
  "https://occ-0-2616-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABQYlg7rw1jw8D4qZVkZSRxxRxXOwsY6wiZLThDOU9YkDTz8PyAUd1_98emUrSzgoPSTjDiMgattAyGUJoEnjCeNkH-3rlvE4Tg.png?r=eea",
  "https://occ-0-2616-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABednHIHIK95jF0b_4JSktrUZP1DSpXOuQU8wG6-IN1KiVYw0Y9cm1JMvT_MJwIES-p-veL5xBkrWyKAcHIUX_XIhuqSNlMYzWg.png?r=d47",
  "https://occ-0-2616-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABSn2_6LFL85K2778XevmpMlKrQdbxP8sDwZtd2J3rQbp9DHH4pSvtfhbDmiFQb1MYo1BP1bfbiswS36yZAT0lrAGEAdL2-fxxA.png?r=ce4",
  "https://occ-0-2616-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABdgqRu86LNrfFPuQ2Xhlz2NQehmsezXIx7HyVhyQXZ1wK8n97QjoJnDaiuKnWVnXclSIoqmrdlcXykFzFbnQP91p8rM-yxTFwQ.png?r=181",
  "https://occ-0-2616-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABehDTgrvOefFyObWbjOTzKjknqbRtz_Io7HXvDa8cRjQzDeTgDAilokPLwip9SqH2AakYYgMrpT_ud75PliaDTTvnmDsWWUmig.png?r=ae9",
  "https://occ-0-2616-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABTNxrMYx95Zi2mfmfaPMiF8ey2_mCKDUQBEelGKAtXySPB8Brc_rxK2O1shyW8PotbLrx6aKb9jWFBEomARoACKwnNBk10bMVA.png?r=ab6",
  "https://occ-0-2616-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABVXCfZIm-VeUYQW9kiW6fc3348Ig5oGRvnyKDTaujX4uP-bX-YStR7hjdjbuGnqs38HETLh3yp4XGJveuz7sKCp3gXQDy9-yTQ.png?r=bb0",
  "https://occ-0-2616-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABf0UoMPJpSWyoWGsqOzi1D8z8mSEa4lNJ__mLyrBF9wMzzNcQAjwA--MeUC2YFWPBktzzwoO0-foCeQJf0h-AX7xIMrRwiPWMg.png?r=59d",
  "https://occ-0-2616-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABa8dC4G0T2Ig7oAMPhdu3Ippq-NACa_jB_m-YUxSszbN34-zwqbOboBsYmNoYTHl4ITjVByIb7THFcephZkAfREU4V80TW5lwA.png?r=15e",
  "https://occ-0-2616-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABT8sUMuSqctHteshq7njO_5-LpEDZEJxml-D7fyKkuadlRmsdTGg4rzZEscPdpdHROTubpN_v4E8wlAi94qmetsgUeiZxjmz9A.png?r=5eb",
  "https://occ-0-2616-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABQl7ujWa2BqsQU9QV7Q-LlJrJtX0uGAkHzMSKwnCohnkZ5KtoQ7PNuWae_QrwkZMSH8txd1K3FEaCh1sytanhx8qdJHHEFGHPA.png?r=ddf"
];

// Render avatar gallery
avatarOptions.forEach((avatarUrl, index) => {
  const img = document.createElement('img');
  img.src = avatarUrl;
  img.className = 'avatar-option';
  img.alt = `Avatar ${index + 1}`;
  
  // Select first avatar by default
  if (index === 0) {
    img.classList.add('selected');
    profileAvatarInput.value = avatarUrl;
  }
  
  img.addEventListener('click', () => {
    // Remove selected class from all avatars
    document.querySelectorAll('.avatar-option').forEach(av => av.classList.remove('selected'));
    
    // Add selected class to clicked avatar
    img.classList.add('selected');
    
    // Update hidden input value
    profileAvatarInput.value = avatarUrl;
  });
  
  avatarGallery.appendChild(img);
});

createProfileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Clear errors
  profileNameError.textContent = '';
  profileAvatarError.textContent = '';
  profileNameInput.classList.remove('error');
  profileAvatarInput.classList.remove('error');
  
  const name = profileNameInput.value.trim();
  const avatar = profileAvatarInput.value;
  
  let hasError = false;
  
  // Validate profile name
  if (!name) {
    profileNameError.textContent = 'Profile name is required';
    profileNameInput.classList.add('error');
    hasError = true;
  }
  
  // Avatar is now required (selected by default from gallery)
  if (!avatar || avatar.trim() === '') {
    profileAvatarError.textContent = 'Please select a profile picture';
    hasError = true;
  }
  
  if (hasError) return;
  
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      window.location.href = "./login.html";
      return;
    }

    // Call API to create profile
    const response = await fetch('/api/profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        avatar: avatar,
        userId: userId
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Redirect to feed page
      window.location.href = './feed.html';
    } else {
      // Show error
      profileNameError.textContent = data.error || 'Failed to create profile';
    }
  } catch (error) {
    console.error('Error creating profile:', error);
    profileNameError.textContent = 'Failed to create profile. Please try again.';
  }
});

// Delete User Form
const deleteUserForm = document.getElementById('deleteUserForm');
const deleteUsernameInput = document.getElementById('deleteUsername');
const deletePasswordInput = document.getElementById('deletePassword');
const deleteUsernameError = document.getElementById('deleteUsernameError');
const deletePasswordError = document.getElementById('deletePasswordError');

// Clear errors on focus
[deleteUsernameInput, deletePasswordInput].forEach(input => {
  input.addEventListener('focus', () => {
    deleteUsernameError.textContent = '';
    deletePasswordError.textContent = '';
    deleteUsernameInput.classList.remove('error');
    deletePasswordInput.classList.remove('error');
  });
});

deleteUserForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Clear errors
  deleteUsernameError.textContent = '';
  deletePasswordError.textContent = '';
  deleteUsernameInput.classList.remove('error');
  deletePasswordInput.classList.remove('error');
  
  const username = deleteUsernameInput.value.trim();
  const password = deletePasswordInput.value;
  
  let hasError = false;
  
  // Validate username
  if (!username) {
    deleteUsernameError.textContent = 'Username is required';
    deleteUsernameInput.classList.add('error');
    hasError = true;
  }
  
  // Validate password
  if (!password) {
    deletePasswordError.textContent = 'Password is required';
    deletePasswordInput.classList.add('error');
    hasError = true;
  }
  
  if (hasError) return;
  
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      window.location.href = "./login.html";
      return;
    }

    // Call API to delete user
    const response = await fetch('/api/auth/user', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        username: username,
        password: password
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Clear localStorage and redirect to login
      localStorage.clear();
      window.location.href = './login.html';
    } else {
      // Show error
      deletePasswordError.textContent = data.error || 'Failed to delete account';
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    deletePasswordError.textContent = 'Failed to delete account. Please try again.';
  }
});


async function fetchMoviesData() {
  try {
    const response = await fetch('/api/content');
    if (!response.ok) {
      throw new Error('Failed to fetch content');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching content:', error);
    return [];
  }
}

async function calculateGenreLikes() {
  const movies = await fetchMoviesData();
  const allGenres = new Set();
  movies.forEach(movie => {
    movie.genre.forEach(g => allGenres.add(g));
  });
  const genreLikes = {};
  allGenres.forEach(g => {
    genreLikes[g] = 0;
  });
  movies.forEach(movie => {
    movie.genre.forEach(g => {
      genreLikes[g] += movie.likes || 0;
    });
  });
  console.log('Genre Likes:', genreLikes);
  return genreLikes;
}

async function prepareChartData() {
  const genreLikes = await calculateGenreLikes();
  const labels = Object.keys(genreLikes);
  const data = Object.values(genreLikes);
  return { labels, data };
}



//create pie chart
async function renderGenreChart() {
  const { labels, data } = await prepareChartData();
  const ctx = document.getElementById('genreChart').getContext('2d');
  const backgroundColors = ['#E989F5','#F589DE','#89F5F1','#ED587A','#77B051'];

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Likes',
        data: data,
        backgroundColor: backgroundColors,
        borderColor: '#141414',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#b3b3b3'
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.chart._metasets[context.datasetIndex].total;
              const value = context.parsed;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${value} likes (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Call the function when the page loads
renderGenreChart();


