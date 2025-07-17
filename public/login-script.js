class LoginManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkAuthStatus();
  }

  setupEventListeners() {
    const loginForm = document.getElementById("loginForm");
    const passwordInput = document.getElementById("password");

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleLogin();
      }
    });
  }

  async checkAuthStatus() {
    try {
      const response = await fetch("/api/auth/check");
      const data = await response.json();

      if (data.authenticated) {
        // User is already logged in, redirect to calendar
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  }

  async handleLogin() {
    const passwordInput = document.getElementById("password");
    const loginBtn = document.getElementById("loginBtn");
    const errorMessage = document.getElementById("errorMessage");

    const password = passwordInput.value.trim();

    if (!password) {
      this.showError("Please enter your password");
      return;
    }

    // Show loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="loading"></span>Verifying...';
    errorMessage.style.display = "none";

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success - show success message and redirect
        loginBtn.innerHTML = "✅ Access Granted!";
        loginBtn.style.background = "#4caf50";

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        // Login failed
        this.showError(data.error || "Invalid password");
        this.resetButton();
      }
    } catch (error) {
      console.error("Login error:", error);
      this.showError("Connection error. Please try again.");
      this.resetButton();
    }
  }

  showError(message) {
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.textContent = message;
    errorMessage.style.display = "block";

    // Clear password field
    document.getElementById("password").value = "";
    document.getElementById("password").focus();
  }

  resetButton() {
    const loginBtn = document.getElementById("loginBtn");
    loginBtn.disabled = false;
    loginBtn.innerHTML = "🚀 Enter Calendar";
    loginBtn.style.background = "";
  }
}

// Initialize login manager when page loads
document.addEventListener("DOMContentLoaded", () => {
  new LoginManager();
});
