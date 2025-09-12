const emailInput = document.querySelector('input[type="text"]');
const passwordInput = document.querySelector('input[type="password"]');
const signInBtn = document.querySelector(".signin-btn");


const emailError = document.createElement("span");
emailError.className = "error-message";
const passwordError = document.createElement("span");
passwordError.className = "error-message";


emailInput.insertAdjacentElement("afterend", emailError);
passwordInput.insertAdjacentElement("afterend", passwordError);


function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function clearErrors() {
  emailError.textContent = "";
  passwordError.textContent = "";
  emailInput.classList.remove("error");
  passwordInput.classList.remove("error");
}

signInBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  clearErrors();

  let isValid = true;

  if (!emailInput.value.trim()) {
    emailError.textContent = "Email is required";
    emailInput.classList.add("error");
    isValid = false;
  } else if (!validateEmail(emailInput.value.trim())) {
    emailError.textContent = "Please enter a valid email";
    emailInput.classList.add("error");
    isValid = false;
  }

  if (!passwordInput.value.trim()) {
    passwordError.textContent = "Password is required";
    passwordInput.classList.add("error");
    isValid = false;
  } else if (passwordInput.value.trim().length < 6) {
    passwordError.textContent = "Password must be at least 6 characters";
    passwordInput.classList.add("error");
    isValid = false;
  }

  if (!isValid) return;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailInput.value.trim(),
        password: passwordInput.value.trim()
      })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", data.user.email);

      window.location.href = "./profiles.html";

    } else {
      if (data.error.toLowerCase().includes("email") || data.error.toLowerCase().includes("username")) {
        emailError.textContent = data.error;
        emailInput.classList.add("error");
      } else if (data.error.toLowerCase().includes("password")) {
        passwordError.textContent = data.error;
        passwordInput.classList.add("error");
      } else {
        emailError.textContent = data.error;
        emailInput.classList.add("error");
      }
    }
  } catch (err) {
    console.error('Login error:', err);
    emailError.textContent = "Server error. Please try again later.";
    emailInput.classList.add("error");
  }
});
