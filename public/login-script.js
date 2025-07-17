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
      console.log("Checking authentication status...");
      const response = await fetch("/api/auth/check");
      console.log("Auth check response status:", response.status);

      if (!response.ok) {
        console.error("Auth check failed with status:", response.status);
        return;
      }

      const data = await response.json();
      console.log("Auth check data:", data);

      if (data.authenticated) {
        console.log("User is already authenticated, redirecting...");
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
      console.log("Attempting login...");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      console.log("Login response status:", response.status);
      console.log("Login response headers:", response.headers);

      if (!response.ok) {
        console.error("Login request failed with status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Login response data:", data);

      if (response.ok && data.success) {
        console.log("Login successful!");
        // Success - show success message and redirect
        loginBtn.innerHTML = "✅ Access Granted!";
        loginBtn.style.background = "#4caf50";

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        console.error("Login failed:", data);
        // Login failed
        this.showError(data.error || "Invalid password");
        this.resetButton();
      }
    } catch (error) {
      console.error("Login error:", error);
      this.showError(
        `Connection error: ${error.message}. Please check the console for details.`
      );
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
