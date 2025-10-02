// Check authentication
function checkAuthentication() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (!isLoggedIn) {
    window.location.href = "./login.html";
    return false;
  }
  return true;
}

// Fetch profiles from backend
async function fetchProfiles() {
  try {
    const response = await fetch('/api/profiles');
    if (!response.ok) {
      throw new Error('Failed to fetch profiles');
    }
    const profiles = await response.json();
    return profiles;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
}

// Render profiles dynamically
function renderProfiles(profiles) {
  const container = document.querySelector('.profiles-container');
  
  // Clear existing profiles except the add profile card
  const addProfileCard = container.querySelector('.add-profile-card');
  container.innerHTML = '';
  
  // Add fetched profiles
  profiles.forEach(profile => {
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.innerHTML = `
      <img src="${profile.avatar}" alt="${profile.name}" class="profile-avatar">
      <div class="profile-name">${profile.name}</div>
    `;
    
    card.addEventListener('click', () => {
      localStorage.setItem("selectedProfileId", profile.id);
      localStorage.setItem("selectedProfileName", profile.name);
      localStorage.setItem("selectedProfileAvatar", profile.avatar);
      window.location.href = "./feed.html";
    });
    
    container.appendChild(card);
  });
  
  // Re-add the add profile card
  container.appendChild(addProfileCard);
}

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  if (!checkAuthentication()) {
    return;
  }

  // Fetch and render profiles from backend
  const profiles = await fetchProfiles();
  renderProfiles(profiles);

  // Handle add profile button
  const addProfileCard = document.querySelector('.add-profile-card');
  addProfileCard.addEventListener('click', () => {
    window.location.href = "./settingsPage.html";
  });
});
