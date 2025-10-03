const emailInput = document.querySelector('input[type="text"]');
const passwordInput = document.querySelector('input[type="password"]');
const signInBtn = document.querySelector(".signin-btn");

// Create error message elements
const emailError = document.createElement("span");
emailError.className = "error-message";
const passwordError = document.createElement("span");
passwordError.className = "error-message";

// Insert error elements after inputs
emailInput.insertAdjacentElement("afterend", emailError);
passwordInput.insertAdjacentElement("afterend", passwordError);

function clearErrors() {
  emailError.textContent = "";
  passwordError.textContent = "";
  emailInput.classList.remove("error");
  passwordInput.classList.remove("error");
}

function showError(input, errorElement, message) {
  errorElement.textContent = message;
  input.classList.add("error");
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validateForm() {
  clearErrors();
  let isValid = true;

  if (!emailInput.value.trim()) {
    showError(emailInput, emailError, "Email is required");
    isValid = false;
  } else if (!validateEmail(emailInput.value.trim())) {
    showError(emailInput, emailError, "Please enter a valid email");
    isValid = false;
  }

  if (!passwordInput.value.trim()) {
    showError(passwordInput, passwordError, "Password is required");
    isValid = false;
  }

  return isValid;
}

// Validate on blur
emailInput.addEventListener('blur', () => {
  if (emailInput.value.trim() && !validateEmail(emailInput.value.trim())) {
    showError(emailInput, emailError, "Please enter a valid email");
  }
});

// Clear errors on focus
[emailInput, passwordInput].forEach(input => {
  input.addEventListener('focus', clearErrors);
});

async function loginUser(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password.trim()
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Store user data
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userEmail", data.user.email);
      
      // Redirect to profiles page
      window.location.href = "./profiles.html";
    } else {
      // Show error message
      showError(emailInput, emailError, data.error || "Login failed");
    }
  } catch (error) {
    console.error('Login error:', error);
    showError(emailInput, emailError, "Login failed. Please try again.");
  }
}

signInBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (validateForm()) {
    loginUser(emailInput.value, passwordInput.value);
  }
});

// Allow Enter key to submit
[emailInput, passwordInput].forEach(input => {
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      signInBtn.click();
    }
  });
});
