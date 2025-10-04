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
    const userId = localStorage.getItem("userId");
    if (!userId) {
      window.location.href = "./login.html";
      return [];
    }
    
    const response = await fetch(`/api/profiles?userId=${userId}`);
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

// State for manage mode
let isManageMode = false;
let profilesData = [];
let addProfileCardHTML = '';

// Render profiles dynamically
function renderProfiles(profiles, manageMode = false) {
  profilesData = profiles;
  const container = document.querySelector('.profiles-container');
  
  // Save add profile card HTML if not already saved
  if (!addProfileCardHTML) {
    const addProfileCard = container.querySelector('.add-profile-card');
    if (addProfileCard) {
      addProfileCardHTML = addProfileCard.outerHTML;
    }
  }
  
  // Clear existing profiles
  container.innerHTML = '';
  
  // Add fetched profiles
  profiles.forEach(profile => {
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.dataset.profileId = profile._id;
    
    let profileHTML = `
      <div class="profile-image-wrapper">
        <img src="${profile.avatar}" alt="${profile.name}" class="profile-avatar">
    `;
    
    if (manageMode) {
      profileHTML += `<button class="delete-profile-btn" data-profile-id="${profile._id}">×</button>`;
    }
    
    profileHTML += `</div>`;
    
    if (manageMode) {
      profileHTML += `
        <div class="profile-name-edit">
          <input type="text" class="profile-name-input" value="${profile.name}" data-profile-id="${profile._id}">
          <button class="edit-profile-btn" data-profile-id="${profile._id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
      `;
    } else {
      profileHTML += `<div class="profile-name">${profile.name}</div>`;
    }
    
    card.innerHTML = profileHTML;
    
    if (!manageMode) {
      card.addEventListener('click', () => {
        localStorage.setItem("selectedProfileId", profile._id);
        localStorage.setItem("selectedProfileName", profile.name);
        localStorage.setItem("selectedProfileAvatar", profile.avatar);
        window.location.href = "./feed.html";
      });
    }
    
    container.appendChild(card);
  });
  
  // Re-add the add profile card (only in normal mode)
  if (!manageMode && addProfileCardHTML) {
    container.insertAdjacentHTML('beforeend', addProfileCardHTML);
    
    // Re-attach event listener to the new add profile card
    const newAddProfileCard = container.querySelector('.add-profile-card');
    if (newAddProfileCard) {
      newAddProfileCard.addEventListener('click', () => {
        window.location.href = "./settingsPage.html";
      });
    }
  }
}

// Update profile name
async function updateProfileName(profileId, newName) {
  try {
    const userId = localStorage.getItem("userId");
    const response = await fetch(`/api/profiles/${profileId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName, userId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
}

// Delete profile
async function deleteProfile(profileId) {
  try {
    const userId = localStorage.getItem("userId");
    const response = await fetch(`/api/profiles/${profileId}?userId=${userId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete profile');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting profile:', error);
    return false;
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  if (!checkAuthentication()) {
    return;
  }

  // Fetch and render profiles from backend
  const profiles = await fetchProfiles();
  renderProfiles(profiles, false);

  // Handle add profile button
  const addProfileCard = document.querySelector('.add-profile-card');
  addProfileCard.addEventListener('click', () => {
    window.location.href = "./settingsPage.html";
  });

  // Handle manage profiles button
  const manageBtn = document.getElementById('manageProfilesBtn');
  manageBtn.addEventListener('click', async () => {
    isManageMode = !isManageMode;
    
    if (isManageMode) {
      manageBtn.textContent = 'Save';
      manageBtn.classList.add('save-mode');
      renderProfiles(profilesData, true);
      
      // Add event listeners for edit and delete buttons
      document.querySelectorAll('.edit-profile-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const profileId = btn.dataset.profileId;
          const input = document.querySelector(`.profile-name-input[data-profile-id="${profileId}"]`);
          const newName = input.value.trim();
          
          if (newName && newName.length > 0) {
            await updateProfileName(profileId, newName);
            // Update local data
            const profile = profilesData.find(p => p._id === profileId);
            if (profile) {
              profile.name = newName;
            }
          }
        });
      });
      
      document.querySelectorAll('.delete-profile-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const profileId = btn.dataset.profileId;
          const success = await deleteProfile(profileId);
          if (success) {
            // Remove from local data and re-render
            profilesData = profilesData.filter(p => p._id !== profileId);
            renderProfiles(profilesData, true);
          }
        });
      });
    } else {
      manageBtn.textContent = 'Manage Profiles';
      manageBtn.classList.remove('save-mode');
      // Refresh profiles from backend
      const freshProfiles = await fetchProfiles();
      renderProfiles(freshProfiles, false);
    }
  });
});
