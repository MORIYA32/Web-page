const API_BASE = location.origin.includes(':3000') ? 'http://localhost:3001' : '';

async function getCurrentUser() {
  try {
    const r = await fetch(`${API_BASE}/api/auth/whoami`, { credentials: 'include' });
    if (!r.ok) return null;
    const d = await r.json();
    return d?.user || null;
  } catch {
    return null;
  }
}

function checkAuthentication() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (!isLoggedIn) {
    window.location.href = "./login.html";
    return false;
  }
  return true;
}

async function fetchProfiles() {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      window.location.href = "./login.html";
      return [];
    }

    const response = await fetch(`${API_BASE}/api/profiles?userId=${encodeURIComponent(userId)}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch profiles');

    const profiles = await response.json();
    return profiles;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
}

async function updateProfileName(profileId, newName) {
  try {
    const userId = localStorage.getItem("userId");
    const response = await fetch(`${API_BASE}/api/profiles/${encodeURIComponent(profileId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: newName, userId })
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
}

async function deleteProfile(profileId) {
  try {
    const userId = localStorage.getItem("userId");
    const response = await fetch(`${API_BASE}/api/profiles/${encodeURIComponent(profileId)}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete profile');
    return true;
  } catch (error) {
    console.error('Error deleting profile:', error);
    return false;
  }
}

let isManageMode = false;
let profilesData = [];
let addProfileCardHTML = '';
let editableProfiles = new Set(); 
function renderProfiles(profiles, manageMode = false) {
  profilesData = profiles;
  const container = document.querySelector('.profiles-container');

  if (!addProfileCardHTML) {
    const addProfileCard = container.querySelector('.add-profile-card');
    if (addProfileCard) {
      addProfileCardHTML = addProfileCard.outerHTML;
    }
  }

  container.innerHTML = '';

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
      const isEditable = editableProfiles.has(profile._id);
      profileHTML += `
        <div class="profile-name-edit">
          <input type="text" class="profile-name-input ${isEditable ? 'editable' : ''}" value="${profile.name}" data-profile-id="${profile._id}" ${isEditable ? '' : 'readonly'}>
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

  if (!manageMode && addProfileCardHTML) {
    container.insertAdjacentHTML('beforeend', addProfileCardHTML);

    const newAddProfileCard = container.querySelector('.add-profile-card');
    if (newAddProfileCard) {
      newAddProfileCard.addEventListener('click', () => {
        window.location.href = "./settingsPage.html";
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {

  const me = await getCurrentUser();
  if (!me) {
    window.location.href = "./login.html";
    return;
  }
  if (me.role === 'admin') {
    window.location.href = `${API_BASE}/admin/add-content`;
    return;
  }


  localStorage.setItem("userId", me.id || me._id || "");
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userEmail", me.email || "");
  localStorage.removeItem("selectedProfileId");
  localStorage.removeItem("selectedProfileName");
  localStorage.removeItem("selectedProfileAvatar");

  // Fetch and render profiles from backend
  const profiles = await fetchProfiles();
  renderProfiles(profiles, false);

  // Handle add profile button
  const addProfileCard = document.querySelector('.add-profile-card');
  if (addProfileCard) {
    addProfileCard.addEventListener('click', () => {
      window.location.href = "./settingsPage.html";
    });
  }

  const manageBtn = document.getElementById('manageProfilesBtn');
  manageBtn.addEventListener('click', async () => {
    isManageMode = !isManageMode;

    if (isManageMode) {
      manageBtn.textContent = 'Save';
      manageBtn.classList.add('save-mode');
      editableProfiles.clear();
      renderProfiles(profilesData, true);

      document.querySelectorAll('.edit-profile-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const profileId = btn.dataset.profileId;
          const input = document.querySelector(`.profile-name-input[data-profile-id="${profileId}"]`);

          if (editableProfiles.has(profileId)) return;

          editableProfiles.add(profileId);
          input.removeAttribute('readonly');
          input.classList.add('editable');
          input.focus();
        });
      });

      document.querySelectorAll('.delete-profile-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const profileId = btn.dataset.profileId;
          const success = await deleteProfile(profileId);
          if (success) {
            profilesData = profilesData.filter(p => p._id !== profileId);
            editableProfiles.delete(profileId);
            renderProfiles(profilesData, true);
          }
        });
      });
    } else {
      const savePromises = [];
      editableProfiles.forEach(profileId => {
        const input = document.querySelector(`.profile-name-input[data-profile-id="${profileId}"]`);
        const newName = input.value.trim();
        if (newName && newName.length > 0) {
          const profile = profilesData.find(p => p._id === profileId);
          if (profile && profile.name !== newName) {
            savePromises.push(updateProfileName(profileId, newName));
            profile.name = newName;
          }
        }
      });

      await Promise.all(savePromises);

      manageBtn.textContent = 'Manage Profiles';
      manageBtn.classList.remove('save-mode');
      editableProfiles.clear();

      
      const freshProfiles = await fetchProfiles();
      renderProfiles(freshProfiles, false);
    }
  });
});
