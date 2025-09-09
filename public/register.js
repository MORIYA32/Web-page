const emailInput = document.getElementById('email');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const signUpBtn = document.querySelector(".signup-btn");

// Create error message elements
const emailError = document.createElement("span");
emailError.className = "error-message";
const usernameError = document.createElement("span");
usernameError.className = "error-message";
const passwordError = document.createElement("span");
passwordError.className = "error-message";

// Insert error elements after inputs
emailInput.insertAdjacentElement("afterend", emailError);
usernameInput.insertAdjacentElement("afterend", usernameError);
passwordInput.insertAdjacentElement("afterend", passwordError);

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function clearErrors() {
  emailError.textContent = "";
  usernameError.textContent = "";
  passwordError.textContent = "";
  emailInput.classList.remove("error");
  usernameInput.classList.remove("error");
  passwordInput.classList.remove("error");
}

function showError(input, errorElement, message) {
  errorElement.textContent = message;
  input.classList.add("error");
}

function validateForm() {
  clearErrors();
  let isValid = true;

  // Check if all fields are filled
  if (!emailInput.value.trim()) {
    showError(emailInput, emailError, "Email is required");
    isValid = false;
  } else if (!validateEmail(emailInput.value.trim())) {
    showError(emailInput, emailError, "Please enter a valid email");
    isValid = false;
  }

  if (!usernameInput.value.trim()) {
    showError(usernameInput, usernameError, "Username is required");
    isValid = false;
  } else if (usernameInput.value.trim().length < 3) {
    showError(usernameInput, usernameError, "Username must be at least 3 characters");
    isValid = false;
  }

  if (!passwordInput.value.trim()) {
    showError(passwordInput, passwordError, "Password is required");
    isValid = false;
  } else if (passwordInput.value.trim().length < 6) {
    showError(passwordInput, passwordError, "Password must be at least 6 characters");
    isValid = false;
  }

  return isValid;
}

async function registerUser(email, username, password) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        username: username.trim(),
        password: password.trim()
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Show success message
      const successMessage = document.createElement("div");
      successMessage.className = "success-message";
      successMessage.textContent = "Registration successful! Redirecting to login...";
      signUpBtn.insertAdjacentElement("afterend", successMessage);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "./login.html";
      }, 2000);
    } else {
      // Show server error
      if (data.error.includes('email')) {
        showError(emailInput, emailError, data.error);
      } else if (data.error.includes('username')) {
        showError(usernameInput, usernameError, data.error);
      } else {
        showError(emailInput, emailError, data.error);
      }
    }
  } catch (error) {
    console.error('Registration error:', error);
    showError(emailInput, emailError, "Registration failed. Please try again.");
  }
}

signUpBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (validateForm()) {
    registerUser(emailInput.value, usernameInput.value, passwordInput.value);
  }
});