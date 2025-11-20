const BASE_URL = "http://localhost:5000"; 
let currentUser = "";

// ------------------------------
// AUTH FUNCTIONS
// ------------------------------
function showRegister() {
    document.getElementById("registerCard").classList.remove("hidden-section");
    document.getElementById("loginCard").classList.add("hidden-section");
}

function showLogin() {
    document.getElementById("registerCard").classList.add("hidden-section");
    document.getElementById("loginCard").classList.remove("hidden-section");
}

async function registerUser() {
    const name = document.getElementById("regName").value;
    const username = document.getElementById("regUsername").value;
    const password = document.getElementById("regPassword").value;
    const age = document.getElementById("regAge").value;
    const weight = document.getElementById("regWeight").value;
    const height = document.getElementById("regHeight").value;

    const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password, age, weight, height })
    });

    const data = await res.json();
    alert(data.message || data.error);
    if (res.ok) showLogin();
}

async function loginUser() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
        currentUser = username;
        document.getElementById("authSection").classList.add("hidden-section");
        document.getElementById("appHeader").classList.remove("hidden-section");
        document.getElementById("mainApp").classList.remove("hidden-section");
        showDashboard();
        loadProfile();
        loadExercises(); // load saved exercises if any
        getMeals();      // load saved meals
    } else {
        alert(data.error);
    }
}

function logout() {
    currentUser = "";
    document.getElementById("authSection").classList.remove("hidden-section");
    document.getElementById("appHeader").classList.add("hidden-section");
    document.getElementById("mainApp").classList.add("hidden-section");
}

// ------------------------------
// NAVIGATION
// ------------------------------
function setActiveNav(btn) {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

function showDashboard() {
    toggleSection("dashboard");
    updateDashboard();
    setActiveNav(event.target);
}

function showExercise() {
    toggleSection("exercise");
    loadExercises();
    setActiveNav(event.target);
}

function showNutrition() {
    toggleSection("nutrition");
    getMeals();
    setActiveNav(event.target);
}

function showProfile() {
    toggleSection("profile");
    setActiveNav(event.target);
    loadProfile();
}

function toggleSection(sectionId) {
    document.querySelectorAll("main section").forEach(sec => sec.classList.add("hidden-section"));
    document.getElementById(sectionId).classList.remove("hidden-section");
}

// ------------------------------
// MEALS
// ------------------------------
async function addMeal() {
    const meal = document.getElementById("mealInput").value;
    if (!meal) return alert("Enter a meal");

    const calories = Math.floor(Math.random() * 200) + 50; // simulate calories

    await fetch(`${BASE_URL}/api/nutrition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser, meal, calories })
    });

    document.getElementById("mealInput").value = "";
    getMeals();
}

async function getMeals() {
    const res = await fetch(`${BASE_URL}/api/nutrition/${currentUser}`);
    const meals = await res.json();

    const list = document.getElementById("mealList");
    list.innerHTML = "";

    let total = 0;
    meals.forEach((m, i) => {
        const p = document.createElement("p");
        p.textContent = `${m.meal} - ${m.calories} kcal`;
        const btn = document.createElement("button");
        btn.textContent = "Delete";
        btn.onclick = () => deleteMeal(i);
        p.appendChild(btn);
        list.appendChild(p);
        total += m.calories;
    });

    document.getElementById("calories").textContent = `${total} kcal`;
    document.getElementById("calorieBar").style.width = Math.min(total / 2000 * 100, 100) + "%";
}

async function deleteMeal(index) {
    await fetch(`${BASE_URL}/api/nutrition/${currentUser}/${index}`, { method: "DELETE" });
    getMeals();
}

// ------------------------------
// EXERCISE TRACKER
// ------------------------------
function loadExercises() {
    const saved = JSON.parse(localStorage.getItem("exercises")) || [];
    const list = document.getElementById("exerciseList");
    list.innerHTML = "";

    let totalVolume = 0;
    let totalDuration = 0;

    saved.forEach(ex => {
        const item = document.createElement("p");
        const vol = ex.sets * ex.reps * (ex.weight || 0);
        totalVolume += vol;
        totalDuration += ex.duration || 10; // default duration for older entries

        item.textContent = `${ex.name} - ${ex.sets} sets × ${ex.reps} reps (${ex.weight || 0}kg)`;
        const btn = document.createElement("button");
        btn.textContent = "Delete";
        btn.onclick = () => deleteExercise(ex.name);
        item.appendChild(btn);
        list.appendChild(item);
    });

    document.getElementById("totalVolume").textContent = totalVolume;
    document.getElementById("exerciseTotal").textContent = `${totalDuration} mins`;
    document.getElementById("exerciseBar").style.width = Math.min(totalDuration / 60 * 100, 100) + "%";

    updateDashboard();
}

function addSetRepExercise() {
    const name = document.getElementById("exName").value;
    const sets = parseInt(document.getElementById("exSets").value);
    const reps = parseInt(document.getElementById("exReps").value);
    const weight = parseInt(document.getElementById("exWeight").value || 0);

    if (!name || !sets || !reps) {
        alert("Please fill all required fields!");
        return;
    }

    const saved = JSON.parse(localStorage.getItem("exercises")) || [];
    saved.push({ name, sets, reps, weight, duration: sets * reps }); // approximate duration
    localStorage.setItem("exercises", JSON.stringify(saved));

    document.getElementById("exName").value = "";
    document.getElementById("exSets").value = "";
    document.getElementById("exReps").value = "";
    document.getElementById("exWeight").value = "";

    loadExercises();
}

function deleteExercise(name) {
    const saved = JSON.parse(localStorage.getItem("exercises")) || [];
    const updated = saved.filter(ex => ex.name !== name);
    localStorage.setItem("exercises", JSON.stringify(updated));
    loadExercises();
}

function resetExercise() {
    if (confirm("Reset today's exercises?")) {
        localStorage.removeItem("exercises");
        loadExercises();
    }
}

// ------------------------------
// DASHBOARD
// ------------------------------
function updateDashboard() {
    const calories = parseInt(document.getElementById("calories").textContent) || 0;
    const exercise = parseInt(document.getElementById("exerciseTotal").textContent) || 0;
    const progress = Math.min((calories / 2000 + exercise / 60) * 50, 100).toFixed(0);
    document.getElementById("progress").textContent = `${progress}%`;
}

// ------------------------------
// PROFILE
// ------------------------------
async function loadProfile() {
    const res = await fetch(`${BASE_URL}/api/profile/${currentUser}`);
    const data = await res.json();

    document.getElementById("profileUsername").textContent = data.username;
    document.getElementById("profileName").textContent = data.name;
    document.getElementById("profileAge").textContent = data.age;
    document.getElementById("profileWeight").textContent = data.weight;
    document.getElementById("profileHeight").textContent = data.height;
}

async function updateProfile() {
    const name = document.getElementById("editName").value;
    const age = document.getElementById("editAge").value;
    const weight = document.getElementById("editWeight").value;
    const height = document.getElementById("editHeight").value;

    await fetch(`${BASE_URL}/api/profile/${currentUser}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, age, weight, height })
    });

    alert("Profile updated!");
    loadProfile();
}

// ------------------------------
// SPEECH INPUT
// ------------------------------
function startVoiceMeal() {
    if (!('webkitSpeechRecognition' in window)) return alert("Speech not supported");
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    recognition.onresult = function(event) {
        document.getElementById("mealInput").value = event.results[0][0].transcript;
    }
}

function startVoiceExercise() {
    if (!('webkitSpeechRecognition' in window)) return alert("Speech not supported");
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    recognition.onresult = function(event) {
        document.getElementById("exName").value = event.results[0][0].transcript;
    }
}
