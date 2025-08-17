let scores = {
    morris: 0,
    ize: 0
};

async function fetchScores() {
    try {
        const response = await fetch('/api/scores');
        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        scores = data;
        updateUI();
    } catch (e) {
        // fallback: laat scores op 0
    }
}

async function addPoint(child) {
    scores[child]++;
    updateUI();
    try {
        const response = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scores)
        });
        if (response.ok) {
            const data = await response.json();
            scores = data;
            updateUI();
        }
    } catch (e) {
        // eventueel error handling
    }
}

function updateUI() {
    ['morris', 'ize'].forEach(child => {
        document.getElementById(child + '-score').innerText = scores[child];
        updateMilestones(child);
    });
}

function updateMilestones(child) {
    const foodMilestone = 10;
    const bossMilestone = 100;

    const foodRemaining = foodMilestone - (scores[child] % foodMilestone);
    const bossRemaining = bossMilestone - (scores[child] % bossMilestone);

    document.getElementById(child + '-food').innerText = ` nog ${foodRemaining}`;
    document.getElementById(child + '-boss').innerText = ` nog ${bossRemaining}`;
}

// Init scores bij laden pagina
window.addEventListener('DOMContentLoaded', fetchScores);

// PWA: registreer service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js');
    });
}

// PIN modal & edit functionaliteit
const PIN_CODE = "7868";

function isEditMode() {
    return window.location.search.includes('edit');
}

function showEditUI() {
    document.querySelectorAll('.edit-only').forEach(btn => btn.style.display = 'block');
}

function hideEditUI() {
    document.querySelectorAll('.edit-only').forEach(btn => btn.style.display = 'none');
}

function showPinModal() {
    const modal = document.getElementById('pin-modal');
    modal.style.display = 'flex';
    document.getElementById('pin-input').value = '';
    document.getElementById('pin-error').style.display = 'none';
    document.getElementById('pin-input').focus();

    // Voeg click event toe om modal te sluiten als je erbuiten klikt
    function outsideClickHandler(e) {
        if (e.target === modal) {
            hidePinModal();
            hideEditUI();
            modal.removeEventListener('click', outsideClickHandler);
        }
    }
    modal.addEventListener('click', outsideClickHandler);
}

function hidePinModal() {
    document.getElementById('pin-modal').style.display = 'none';
}

if (isEditMode()) {
    hideEditUI();
    showPinModal();
    document.getElementById('pin-input').addEventListener('input', function(e) {
        const val = e.target.value;
        if (val.length === 4) {
            if (val === PIN_CODE) {
                hidePinModal();
                showEditUI();
            } else {
                document.getElementById('pin-error').style.display = '';
                e.target.value = '';
            }
        }
    });
} else {
    hideEditUI();
}
