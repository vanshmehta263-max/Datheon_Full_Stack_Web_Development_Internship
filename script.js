
// ==============================
// MOBILE NAVIGATION
// ==============================

const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");

menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    const isOpen = navLinks.classList.contains("active");

    menuBtn.setAttribute("aria-expanded", isOpen);
    menuBtn.textContent = isOpen ? "✕" : "☰";
});

// Close mobile menu after clicking a link

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.textContent = "☰";
    });
});


// ==============================
// DARK / LIGHT MODE
// ==============================

const themeButton = document.getElementById("theme-toggle");

// Load saved theme

const savedTheme = localStorage.getItem("portfolio-theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeButton.textContent = "☀️";
}

themeButton.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");

    themeButton.textContent = isDark ? "☀️" : "🌙";

    localStorage.setItem(
        "portfolio-theme",
        isDark ? "dark" : "light"
    );
});


// ==============================
// PROJECT POPUP MODAL
// ==============================

const modal = document.getElementById("project-modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const closeModal = document.getElementById("close-modal");

const projectButtons = document.querySelectorAll(".project-btn");

// Open popup

projectButtons.forEach(button => {

    button.addEventListener("click", () => {

        const title = button.dataset.title;
        const description = button.dataset.description;

        modalTitle.textContent = title;
        modalDescription.textContent = description;

        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");

        closeModal.focus();
    });

});

// Close popup using close button

closeModal.addEventListener("click", () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
});

// Close popup by clicking outside

modal.addEventListener("click", (event) => {

    if (event.target === modal) {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
    }

});

// Close popup using Escape key

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
    }

});


// ==============================
// AUTOMATIC COPYRIGHT YEAR
// ==============================

document.getElementById("year").textContent =
    new Date().getFullYear();
