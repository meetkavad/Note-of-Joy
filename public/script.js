class ExcitementCalendar {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.events = {};
    this.init();
  }

  async init() {
    // Check authentication first
    const isAuthenticated = await this.checkAuth();
    if (!isAuthenticated) {
      window.location.href = "/login.html";
      return;
    }

    this.renderCalendar();
    this.setupEventListeners();
  }

  async checkAuth() {
    try {
      const response = await fetch("/api/auth/check");
      const data = await response.json();
      return data.authenticated;
    } catch (error) {
      console.error("Auth check error:", error);
      return false;
    }
  }

  setupEventListeners() {
    // Logout button
    document.getElementById("logoutBtn").addEventListener("click", () => {
      this.handleLogout();
    });

    // Calendar navigation
    document.getElementById("prevMonth").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderCalendar();
    });

    document.getElementById("nextMonth").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderCalendar();
    });

    // Add event listeners
    document
      .getElementById("addExcitingTodayBtn")
      .addEventListener("click", () => {
        this.addExcitingToday();
      });

    document
      .getElementById("addFutureExpectationBtn")
      .addEventListener("click", () => {
        this.addFutureExpectation();
      });

    // Enter key listeners
    document
      .getElementById("excitingTodayInput")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.addExcitingToday();
        }
      });

    document
      .getElementById("futureExpectationInput")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.addFutureExpectation();
        }
      });
  }

  renderCalendar() {
    const calendar = document.getElementById("calendar");
    const monthTitle = document.getElementById("currentMonth");

    // Clear calendar
    calendar.innerHTML = "";

    // Set month title
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    monthTitle.textContent = `${
      monthNames[this.currentDate.getMonth()]
    } ${this.currentDate.getFullYear()}`;

    // Add day headers
    const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayHeaders.forEach((day) => {
      const dayHeader = document.createElement("div");
      dayHeader.className = "calendar-day day-header";
      dayHeader.textContent = day;
      calendar.appendChild(dayHeader);
    });

    // Get first day of month and number of days
    const firstDay = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      1
    );
    const lastDay = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      0
    );
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generate calendar days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayElement = document.createElement("div");
      dayElement.className = "calendar-day";
      dayElement.textContent = date.getDate();

      // Add classes based on date
      if (date.getMonth() !== this.currentDate.getMonth()) {
        dayElement.style.color = "#ccc";
        dayElement.style.pointerEvents = "none";
      } else {
        const dateString = this.formatDate(date);

        if (date.getTime() === today.getTime()) {
          dayElement.classList.add("today");
        } else if (date < today) {
          dayElement.classList.add("past");
        } else {
          dayElement.classList.add("future");
        }

        // Check if date has events
        if (
          this.events[dateString] &&
          (this.events[dateString].excitingToday?.length > 0 ||
            this.events[dateString].futureExpectations?.length > 0)
        ) {
          dayElement.classList.add("has-events");
        }

        // Add click listener
        dayElement.addEventListener("click", (event) => {
          this.selectDate(date, event.target);
        });
      }

      calendar.appendChild(dayElement);
    }
  }

  async selectDate(date, targetElement) {
    this.selectedDate = date;
    const dateString = this.formatDate(date);
    console.log(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update selected date styling
    document.querySelectorAll(".calendar-day").forEach((day) => {
      day.classList.remove("selected");
    });
    if (targetElement) {
      targetElement.classList.add("selected");
    }

    // Update date title
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    document.getElementById("selectedDateTitle").textContent =
      date.toLocaleDateString("en-US", options);

    // Show/hide add buttons based on date
    const isToday = date.getTime() === today.getTime();
    const isFuture = date >= today;
    const isPast = date < today;

    document.getElementById("selectedDateInfo").textContent = isPast
      ? "Past date - View only mode"
      : isToday
      ? "Today - Add your exciting moments!"
      : "Future date - Add your expectations!";

    // Show events container
    document.getElementById("eventsContainer").style.display = "block";

    // Enable/disable add buttons
    const addButtons = document.querySelectorAll(".add-event button");
    const addInputs = document.querySelectorAll(".add-event input");

    addButtons.forEach((btn) => (btn.disabled = isPast));
    addInputs.forEach((input) => (input.disabled = isPast));

    // Show readonly message for past dates
    this.showReadonlyMessage(isPast);

    // Load events for the selected date
    await this.loadEvents(dateString);
  }

  showReadonlyMessage(isPast) {
    const existingMessage = document.querySelector(".readonly-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    if (isPast) {
      const message = document.createElement("div");
      message.className = "readonly-message";
      message.textContent =
        "This is a past date. You can view events but cannot add new ones.";
      document
        .getElementById("eventsContainer")
        .insertBefore(message, document.querySelector(".event-category"));
    }
  }

  async loadEvents(dateString) {
    try {
      const response = await fetch(`/api/events/${dateString}`);
      const events = await response.json();

      this.events[dateString] = events;
      this.renderEvents(events);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  }

  renderEvents(events) {
    this.renderEventList(
      "excitingTodayList",
      events.excitingToday || [],
      "exciting-today"
    );
    this.renderEventList(
      "futureExpectationsList",
      events.futureExpectations || [],
      "future-expectations"
    );
  }

  renderEventList(listId, items, type) {
    const list = document.getElementById(listId);
    list.innerHTML = "";

    if (items.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";
      emptyState.textContent = "No items yet. Add something!";
      list.appendChild(emptyState);
      return;
    }

    items.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.className = "event-item";

      const eventText = document.createElement("span");
      eventText.className = "event-text";
      eventText.textContent = item.text;

      const eventTime = document.createElement("span");
      eventTime.className = "event-time";
      const time = new Date(item.timestamp);
      eventTime.textContent = time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => this.deleteEvent(item.id, type);

      // Disable delete button for past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (this.selectedDate < today) {
        deleteBtn.disabled = true;
        deleteBtn.style.display = "none";
      }

      listItem.appendChild(eventText);
      listItem.appendChild(eventTime);
      listItem.appendChild(deleteBtn);
      list.appendChild(listItem);
    });
  }

  async addExcitingToday() {
    const input = document.getElementById("excitingTodayInput");
    const text = input.value.trim();

    if (!text) {
      alert("Please enter some text before adding an event.");
      return;
    }

    if (!this.selectedDate) {
      alert("Please select a date first.");
      return;
    }

    try {
      const dateString = this.formatDate(this.selectedDate);
      console.log("Adding exciting today event for date:", dateString);

      const response = await fetch(`/api/events/${dateString}/exciting-today`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const events = await response.json();
        this.events[dateString] = events;
        this.renderEvents(events);
        input.value = "";
        this.renderCalendar(); // Refresh calendar to show event indicator
      } else {
        const error = await response.json();
        console.error("Server error:", error);
        alert(error.error || "Failed to add event");
      }
    } catch (error) {
      console.error("Error adding exciting today:", error);
      alert("Failed to add event. Please check your connection and try again.");
    }
  }

  async addFutureExpectation() {
    const input = document.getElementById("futureExpectationInput");
    const text = input.value.trim();

    if (!text) {
      alert("Please enter some text before adding an event.");
      return;
    }

    if (!this.selectedDate) {
      alert("Please select a date first.");
      return;
    }

    try {
      const dateString = this.formatDate(this.selectedDate);
      console.log("Adding future expectation for date:", dateString);

      const response = await fetch(
        `/api/events/${dateString}/future-expectations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        }
      );

      console.log("Response status:", response.status);

      if (response.ok) {
        const events = await response.json();
        this.events[dateString] = events;
        this.renderEvents(events);
        input.value = "";
        this.renderCalendar(); // Refresh calendar to show event indicator
      } else {
        const error = await response.json();
        console.error("Server error:", error);
        alert(error.error || "Failed to add event");
      }
    } catch (error) {
      console.error("Error adding future expectation:", error);
      alert("Failed to add event. Please check your connection and try again.");
    }
  }

  async deleteEvent(itemId, type) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const dateString = this.formatDate(this.selectedDate);
      const response = await fetch(
        `/api/events/${dateString}/${type}/${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const events = await response.json();
        this.events[dateString] = events;
        this.renderEvents(events);
        this.renderCalendar(); // Refresh calendar to update event indicator
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    }
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        window.location.href = "/login.html";
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  }
}

// Initialize the calendar when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new ExcitementCalendar();
});
