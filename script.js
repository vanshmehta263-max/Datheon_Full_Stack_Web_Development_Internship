
// ========================================
// TASK MANAGER - TASKFLOW
// CRUD + LOCAL STORAGE
// ========================================

// Get HTML elements

const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const taskCategory = document.getElementById("task-category");
const taskDate = document.getElementById("task-date");
const taskList = document.getElementById("task-list");

const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit");
const formHeading = document.getElementById("form-heading");

const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");

const totalCount = document.getElementById("total-count");
const activeCount = document.getElementById("active-count");
const completedCount = document.getElementById("completed-count");
const progressCount = document.getElementById("progress-count");

const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");
const remainingText = document.getElementById("remaining-text");
const visibleCount = document.getElementById("visible-count");

const themeButton = document.getElementById("theme-toggle");


// ========================================
// APPLICATION DATA
// ========================================

// Load previously saved tasks

function loadFromLocalStorage() {
    try {
        const savedTasks = localStorage.getItem("taskflow-tasks");
        const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];

        return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch (error) {
        console.error("Could not load tasks:", error);
        return [];
    }
}

let tasks = loadFromLocalStorage();

let currentFilter = "All";
let editingTaskId = null;


// ========================================
// SAVE DATA
// ========================================

function saveToLocalStorage() {
    try {
        localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
    } catch (error) {
        alert("Unable to save tasks in browser storage.");
        console.error(error);
    }
}


// ========================================
// GENERATE UNIQUE ID
// ========================================

function generateId() {
    if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }

    return Date.now().toString() + Math.random().toString(16).slice(2);
}


// ========================================
// CREATE TASK
// ========================================

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const title = taskTitle.value.trim();

    if (!title) {
        alert("Please enter a task name.");
        return;
    }

    // UPDATE EXISTING TASK

    if (editingTaskId !== null) {

        const task = tasks.find(
            item => item.id === editingTaskId
        );

        if (task) {
            task.title = title;
            task.category = taskCategory.value;
            task.date = taskDate.value;
        }

        editingTaskId = null;

        submitBtn.textContent = "+ Add Task";
        formHeading.textContent = "Add New Task";
        cancelEditBtn.hidden = true;

    }

    // CREATE NEW TASK

    else {

        const newTask = {
            id: generateId(),
            title: title,
            category: taskCategory.value,
            date: taskDate.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);

    }

    saveToLocalStorage();

    taskForm.reset();

    renderTasks();

});


// ========================================
// READ / DISPLAY TASKS
// ========================================

function renderTasks() {

    taskList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase().trim();

    const selectedCategory = categoryFilter.value;

    // Apply filters

    const filteredTasks = tasks.filter(task => {

        const matchesStatus =
            currentFilter === "All" ||
            (currentFilter === "Active" && !task.completed) ||
            (currentFilter === "Completed" && task.completed);

        const matchesCategory =
            selectedCategory === "All" ||
            task.category === selectedCategory;

        const matchesSearch =
            task.title.toLowerCase().includes(searchText);

        return matchesStatus && matchesCategory && matchesSearch;

    });

    // Empty state

    if (filteredTasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-state">
                <span>📝</span>
                <h3>No tasks found</h3>
                <p>Try another search or add a new task.</p>
            </div>
        `;

    }

    // Create task elements

    filteredTasks.forEach(task => {

        const taskElement = document.createElement("article");

        taskElement.className = "task-item";

        if (task.completed) {
            taskElement.classList.add("completed");
        }

        // Create elements safely

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            "Mark " + task.title + " as completed"
        );

        const details = document.createElement("div");
        details.className = "task-details";

        const title = document.createElement("h3");
        title.textContent = task.title;

        const description = document.createElement("p");
        description.textContent = task.completed
            ? "Completed"
            : "In progress";

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const category = document.createElement("span");
        category.className = "category-badge";
        category.textContent = "📁 " + task.category;

        meta.appendChild(category);

        if (task.date) {

            const dateBadge = document.createElement("span");
            dateBadge.className = "date-badge";

            const dueDate = new Date(task.date + "T00:00:00");
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            dateBadge.textContent = "📅 " +
                dueDate.toLocaleDateString("en-IN");

            if (!task.completed && dueDate < today) {
                dateBadge.textContent += " • Overdue";
                dateBadge.style.color = "#ef4444";
            }

            meta.appendChild(dateBadge);
        }

        details.append(title, description, meta);

        // Action buttons

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.className = "action-btn";
        editButton.textContent = "✏️";
        editButton.title = "Edit task";
        editButton.setAttribute("aria-label", "Edit " + task.title);

        const deleteButton = document.createElement("button");
        deleteButton.className = "action-btn delete-btn";
        deleteButton.textContent = "🗑️";
        deleteButton.title = "Delete task";
        deleteButton.setAttribute("aria-label", "Delete " + task.title);

        actions.append(editButton, deleteButton);

        // Attach event listeners

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        editButton.addEventListener("click", () => {
            editTask(task.id);
        });

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        taskElement.append(checkbox, details, actions);

        taskList.appendChild(taskElement);

    });

    visibleCount.textContent =
        filteredTasks.length + " tasks";

    updateStatistics();
    updateStatusGraph();
}


// ========================================
// UPDATE TASK STATUS
// ========================================

function toggleTask(id) {

    const task = tasks.find(item => item.id === id);

    if (!task) return;

    task.completed = !task.completed;

    saveToLocalStorage();

    renderTasks();

}


// ========================================
// UPDATE / EDIT TASK
// ========================================

function editTask(id) {

    const task = tasks.find(item => item.id === id);

    if (!task) return;

    editingTaskId = id;

    taskTitle.value = task.title;
    taskCategory.value = task.category;
    taskDate.value = task.date;

    submitBtn.textContent = "Save Changes";
    formHeading.textContent = "Edit Task";

    cancelEditBtn.hidden = false;

    document.querySelector(".add-panel").scrollIntoView({
        behavior: "smooth"
    });

    taskTitle.focus();

}


// ========================================
// CANCEL EDITING
// ========================================

cancelEditBtn.addEventListener("click", () => {

    editingTaskId = null;

    taskForm.reset();

    submitBtn.textContent = "+ Add Task";
    formHeading.textContent = "Add New Task";

    cancelEditBtn.hidden = true;

});


// ========================================
// DELETE TASK
// ========================================

function deleteTask(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    tasks = tasks.filter(item => item.id !== id);

    if (editingTaskId === id) {
        editingTaskId = null;
        taskForm.reset();
        submitBtn.textContent = "+ Add Task";
        formHeading.textContent = "Add New Task";
        cancelEditBtn.hidden = true;
    }

    saveToLocalStorage();

    renderTasks();

}


// ========================================
// FILTER TASKS
// ========================================

document.querySelectorAll(".filter-btn").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();

    });

});


// ========================================
// CATEGORY FILTER
// ========================================

categoryFilter.addEventListener("change", renderTasks);


// ========================================
// SEARCH TASKS
// ========================================

searchInput.addEventListener("input", renderTasks);


// ========================================
// CLEAR COMPLETED TASKS
// ========================================

document.getElementById("clear-completed").addEventListener("click", () => {

    const hasCompleted = tasks.some(task => task.completed);

    if (!hasCompleted) {
        alert("There are no completed tasks to clear.");
        return;
    }

    const confirmed = confirm(
        "Delete all completed tasks?"
    );

    if (!confirmed) return;

    tasks = tasks.filter(task => !task.completed);

    saveToLocalStorage();

    renderTasks();

});


// ========================================
// UPDATE DASHBOARD STATISTICS
// ========================================

function updateStatistics() {


    // ========================================
    // UPDATE TASK STATUS GRAPH
    // ========================================

    function updateStatusGraph() {

        const total = tasks.length;

        const completed = tasks.filter(
            task => task.completed
        ).length;

        const active = total - completed;

        const completedPercentage = total === 0
            ? 0
            : Math.round((completed / total) * 100);

        const activePercentage = total === 0
            ? 0
            : 100 - completedPercentage;

        // Update center number

        document.getElementById("chart-total").textContent = total;

        // Update legend

        document.getElementById("chart-completed").textContent =
            completed + " tasks";

        document.getElementById("chart-active").textContent =
            active + " tasks";

        document.getElementById("completed-percent").textContent =
            completedPercentage + "%";

        document.getElementById("active-percent").textContent =
            activePercentage + "%";

        // Update donut graph

        const chart = document.getElementById("status-chart");

        if (total === 0) {

            chart.style.background =
                "#dfe4ed";

        } else {

            chart.style.background = `
            conic-gradient(
                #16a77a 0% ${completedPercentage}%,
                #536dfe ${completedPercentage}% 100%
            )
        `;

        }

        // Update productivity message

        const message = document.getElementById("chart-message");

        if (total === 0) {
            message.textContent = "Let's get started!";
        } else if (completed === total) {
            message.textContent = "Excellent work! 🎉";
        } else if (completedPercentage >= 50) {
            message.textContent = "Great progress! 🚀";
        } else {
            message.textContent = "Keep going! 💪";
        }

    }


}


// ========================================
// DARK / LIGHT THEME
// ========================================

const savedTheme = localStorage.getItem("taskflow-theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeButton.textContent = "☀️";
}

themeButton.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");

    themeButton.textContent = isDark ? "☀️" : "🌙";

    localStorage.setItem(
        "taskflow-theme",
        isDark ? "dark" : "light"
    );

});


// ========================================
// DATE AND COPYRIGHT
// ========================================

const today = new Date();

document.getElementById("today-label").textContent =
    today.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });

document.getElementById("year").textContent =
    today.getFullYear();


// ========================================
// INITIALIZE APPLICATION
// ========================================

renderTasks();
