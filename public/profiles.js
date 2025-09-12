document.addEventListener("DOMContentLoaded", async () => {

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (!isLoggedIn) {
    window.location.href = "./login.html";
    return;
  }

  async function fetchProfiles() {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`/api/profiles?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch profiles');
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  }
  function renderProfiles(profiles) {
    const container = document.querySelector(".profiles-container");
    container.innerHTML = '';

    profiles.forEach(profile => {
      const card = document.createElement("div");
      card.className = "profile-card";

      card.innerHTML = `
        <img src="${profile.avatar}" alt="${profile.name}" class="profile-avatar">
        <div class="profile-name">${profile.name}</div>
      `;

      card.addEventListener("click", () => {
        localStorage.setItem("selectedProfileId", profile.id);
        localStorage.setItem("selectedProfileName", profile.name);
        localStorage.setItem("selectedProfileAvatar", profile.avatar);
        window.location.href = "./feed.html";
      });

      container.appendChild(card);
    });

    const addCard = document.createElement("div");
    addCard.className = "profile-card add-profile-card";
    addCard.innerHTML = `
      <div class="add-profile-swap">
        <img src="https://www.avivhegia.co.il/wp-content/uploads/2025/08/add_profile_icon.jpg" alt="Add Profile" class="profile-avatar img-default">
        <img src="https://www.avivhegia.co.il/wp-content/uploads/2025/08/add_profile_icon_hover.jpg" alt="" aria-hidden="true" class="profile-avatar img-hover">
      </div>
      <div class="profile-name">Add Profile</div>
    `;
    addCard.addEventListener("click", () => {
      alert("Add Profile clicked!");
    });

    container.appendChild(addCard);
  }

  const profiles = await fetchProfiles();
  renderProfiles(profiles);

});
