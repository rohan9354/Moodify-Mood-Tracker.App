
const calendar = document.getElementById("calendar");
const logMoodButton = document.getElementById("log-mood");
const moodButtons = document.querySelectorAll(".mood-btn");
const moodNoteInput = document.getElementById("mood-note");
const chartCanvas = document.getElementById("mood-chart").getContext("2d");
const moodDateInput = document.getElementById("mood-date");
const deleteDateInput = document.getElementById("delete-date");

let moodLogs = JSON.parse(localStorage.getItem("moodLogs")) || [];
let chartInstance = null; 

function initCalendar() {
    calendar.innerHTML = "";
    const daysInMonth = 30; 
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.textContent = i;

        const log = moodLogs.find((log) => log.day === i);
        if (log) {
            dayDiv.style.backgroundColor = getMoodColor(log.mood);
            dayDiv.style.color = '#ffffff'; 
            dayDiv.classList.add('logged-day'); 
            dayDiv.addEventListener("click", () => openModal(log));
        }

        calendar.appendChild(dayDiv);
    }
}

function getMoodColor(mood) {
    const colors = {
        Happy: "#66BB6A", 
        Sad: "#42A5F5",   
        Angry: "#EF5350", 
        Excited: "#FFCA28",
        Calm: "#81C784",   
        Stressed: "#FF7043" 
    };
    return colors[mood] || "#ddd";
}


logMoodButton.addEventListener("click", () => {
    const selectedMoodButton = [...moodButtons].find((btn) =>
        btn.classList.contains("active")
    );

    if (!selectedMoodButton) {
        alert("Please select a mood!");
        return;
    }

    const selectedMood = selectedMoodButton.dataset.mood;
    const dateValue = moodDateInput.value;
    if (!dateValue) {
        alert("Please select a valid date!");
        return;
    }

    const day = new Date(dateValue).getDate();
    const note = moodNoteInput.value.trim();

    
    const existingLogIndex = moodLogs.findIndex(log => log.day === day);
    if (existingLogIndex !== -1) {
        
        moodLogs[existingLogIndex] = { day, mood: selectedMood, note };
    } else {
        
        moodLogs.push({ day, mood: selectedMood, note });
    }

    localStorage.setItem("moodLogs", JSON.stringify(moodLogs));

    
    moodNoteInput.value = "";
    moodButtons.forEach((btn) => btn.classList.remove("active"));
    moodDateInput.value = new Date().toISOString().split("T")[0]; 

    initCalendar();
    updateChart();
});


moodDateInput.value = new Date().toISOString().split("T")[0];


moodButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        moodButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

function updateChart() {
    if (chartInstance) {
        chartInstance.destroy();
    }

    const moodCounts = moodLogs.reduce((counts, log) => {
        counts[log.mood] = (counts[log.mood] || 0) + 1;
        return counts;
    }, {});

    const hasData = Object.keys(moodCounts).length > 0;
    const labels = hasData ? Object.keys(moodCounts) : ["No Data"];
    const data = hasData ? Object.values(moodCounts) : [1];
    const backgroundColors = hasData ? labels.map(getMoodColor) : ["#ddd"];

    chartInstance = new Chart(chartCanvas, {
        type: "pie",
        data: {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: backgroundColors,
                    hoverOffset: 10, 
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'), 
                        font: {
                            family: 'Poppins', 
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.raw}`,
                    },
                },
            },
        },
    });
}


document.getElementById("delete-mood").addEventListener("click", () => {
    const deleteDateValue = deleteDateInput.value;
    if (!deleteDateValue) {
        alert("Please select a date to delete!");
        return;
    }

    const dayToDelete = new Date(deleteDateValue).getDate();
    const initialLength = moodLogs.length;
    moodLogs = moodLogs.filter((entry) => entry.day !== dayToDelete);

    if (moodLogs.length === initialLength) {
        alert("No mood logged for this date!");
        return;
    }

    localStorage.setItem("moodLogs", JSON.stringify(moodLogs));
    alert(`Mood data for day ${dayToDelete} has been deleted!`);

    initCalendar();
    updateChart();
    deleteDateInput.value = ''; 
});


document.getElementById("refresh-app").addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all data? This action cannot be undone.")) {
        moodLogs = []; 
        localStorage.removeItem("moodLogs"); 
        alert("All data has been reset!");

        initCalendar();
        updateChart();
    }
});


const noteModal = document.getElementById("note-modal");
const closeButton = document.querySelector(".close-button");

function openModal(log) {
    document.getElementById("modal-day").textContent = `Day: ${log.day}`;
    document.getElementById("modal-mood").textContent = `Mood: ${log.mood}`;
    document.getElementById("modal-note").textContent = `Note: ${log.note || "No note available"}`;

    noteModal.classList.add('active');
}

closeButton.addEventListener("click", () => {
    noteModal.classList.remove('active');
});

window.addEventListener("click", (event) => {
    if (event.target === noteModal) {
        noteModal.classList.remove('active');
    }
});



const darkModeToggle = document.getElementById('dark-mode-toggle');

function setPreferredTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

darkModeToggle.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
    
    updateChart();
});


setPreferredTheme(); 
initCalendar();
updateChart();