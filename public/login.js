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

signInBtn.addEventListener("click", (e) => {
    e.preventDefault();

    emailError.textContent = "";
    passwordError.textContent = "";
    emailInput.classList.remove("error");
    passwordInput.classList.remove("error");

    let isValid = true;

    if (emailInput.value.trim() !== "" && !validateEmail(emailInput.value.trim())) {
        emailError.textContent = "Please enter a valid email";
        emailInput.classList.add("error");
        isValid = false;
    }

    if (passwordInput.value.trim() !== "" && passwordInput.value.trim().length < 6) {
        passwordError.textContent = "Password must be at least 6 characters";
        passwordInput.classList.add("error");
        isValid = false;
    }

    if (isValid && emailInput.value.trim() !== "" && passwordInput.value.trim() !== "") {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "./feed.html";
    }
});