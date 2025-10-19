// ====== Login Page Script (full file) ======

// selectors (כמו שהיה אצלך)

const emailInput = document.querySelector('input[type="text"]');
const passwordInput = document.querySelector('input[type="password"]');
const signInBtn = document.querySelector(".signin-btn");

// error elements
const emailError = document.createElement("span");
emailError.className = "error-message";
const passwordError = document.createElement("span");
passwordError.className = "error-message";

// insert after inputs
emailInput.insertAdjacentElement("afterend", emailError);
passwordInput.insertAdjacentElement("afterend", passwordError);

// utils: errors & validation
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

// inline validation
emailInput.addEventListener('blur', () => {
  if (emailInput.value.trim() && !validateEmail(emailInput.value.trim())) {
    showError(emailInput, emailError, "Please enter a valid email");
  }
});

[emailInput, passwordInput].forEach(input => {
  input.addEventListener('focus', clearErrors);
});

// ---- LOGIN (supports admin & regular users)
async function loginUser(email, password) {
  try {
    // UI lock
    signInBtn.disabled = true;
    const oldText = signInBtn.textContent;
    signInBtn.textContent = "Signing in...";

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // חשוב לסשנים ועבור גישת אדמין
      body: JSON.stringify({
        email: email.trim(),
        password: password.trim()
      })
    });

    const data = await response.json();

    if (response.ok) {
      // שמירה מקומית (כמו שהיה, בתוספת role)
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", data?.user?.id || "");
      localStorage.setItem("userEmail", data?.user?.email || "");
      if (data?.user?.role) localStorage.setItem("userRole", data.user.role);

      // ניווט:
      // 1) אם השרת מחזיר redirect — נשתמש בו (אדמין → /admin/add-content)
      // 2) אחרת, אם המשתמש אדמין – ננווט ידנית לשם
      // 3) אחרת – לעמוד הפרופילים (כמו קודם)
      if (data && data.redirect) {
        window.location.href = data.redirect;
      } else if (data?.user?.role === 'admin') {
        window.location.href = '/admin/add-content';
      } else {
        window.location.href = '/profiles'; // היה "./profiles.html" — נתיב השרת שלך משרת אותו
      }
    } else {
      showError(emailInput, emailError, data.error || "Login failed");
    }

    // UI unlock
    signInBtn.disabled = false;
    signInBtn.textContent = oldText;
  } catch (error) {
    console.error('Login error:', error);
    showError(emailInput, emailError, "Login failed. Please try again.");
    signInBtn.disabled = false;
    signInBtn.textContent = "Sign In";
  }
}

// click & enter
signInBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (validateForm()) {
    loginUser(emailInput.value, passwordInput.value);
  }
});

[emailInput, passwordInput].forEach(input => {
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      signInBtn.click();
    }
  });
});
// למעלה פעם אחת:
const API_BASE = location.origin.includes(':3000') ? 'http://localhost:3001' : '';

// ...שאר הקובץ שלך...

async function loginUser(email, password) {
  try {
    signInBtn.disabled = true;
    const oldText = signInBtn.textContent;
    signInBtn.textContent = "Signing in...";

    const resp = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.trim(), password: password.trim() })
    });

    const data = await resp.json();

    if (resp.ok) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", data?.user?.id || "");
      localStorage.setItem("userEmail", data?.user?.email || "");
      if (data?.user?.role) localStorage.setItem("userRole", data.user.role);

      // יעד ניתוב: אם השרת מחזיר redirect – נכבד אותו; אם יחסי, נוסיף API_BASE
      // אחרת: אדמין -> /admin/add-content (על 3001), משתמש רגיל -> /profiles (על 3000)
      let dest = null;
      if (data && data.redirect) {
        dest = data.redirect.startsWith('http')
          ? data.redirect
          : `${API_BASE}${data.redirect}`;
      } else if (data?.user?.role === 'admin') {
        dest = `${API_BASE}/admin/add-content`;
      } else {
        dest = '/profiles';
      }
      window.location.href = dest;
    } else {
      showError(emailInput, emailError, data.error || "Login failed");
    }

    signInBtn.disabled = false;
    signInBtn.textContent = oldText;
  } catch (err) {
    console.error('Login error:', err);
    showError(emailInput, emailError, "Login failed. Please try again.");
    signInBtn.disabled = false;
    signInBtn.textContent = "Sign In";
  }
}
