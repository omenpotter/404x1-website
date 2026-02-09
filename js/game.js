// game.js - Game Integration
// Add this to your game.html page

const API_BASE = 'https://preview-sandbox--b9ecea76254fe996d19766a671cb1856.base44.app';

// Get current user from localStorage
function getCurrentUser() {
    const saved = localStorage.getItem('404x1_user');
    return saved ? JSON.parse(saved) : null;
}

// Submit game score
async function submitScore(score) {
    const user = getCurrentUser();
    
    if (!user) {
        alert('Please login first to submit your score');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/gameSubmit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: user.id,
                score: score
            })
        });

        const data = await response.json();

        if (data.success) {
            const rpEarned = data.rp_earned || 0;
            alert(`Score: ${score}\nRP Earned: ${rpEarned.toFixed(1)}`);
            
            user.reputation_points += rpEarned;
            localStorage.setItem('404x1_user', JSON.stringify(user));
        } else {
            alert('Failed to submit score: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Submit score error:', error);
        alert('Failed to submit score. Please try again.');
    }
}

// Get user stats
async function loadUserStats() {
    const user = getCurrentUser();
    if (!user) return;

    try {
        const response = await fetch(`${API_BASE}/api/gameStats?user_id=${user.id}`);
        const data = await response.json();

        if (data.success) {
            displayUserStats(data.stats);
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Display user stats
function displayUserStats(stats) {
    const statsContainer = document.getElementById('user-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
        <div class="stat-card">
            <h3>${stats.username}</h3>
            <div class="stat-row">
                <span>Total Score:</span>
                <span>${stats.total_score.toLocaleString()}</span>
            </div>
            <div class="stat-row">
                <span>Games Played:</span>
                <span>${stats.games_played}</span>
            </div>
            <div class="stat-row">
                <span>Average Score:</span>
                <span>${stats.average_score.toLocaleString()}</span>
            </div>
            <div class="stat-row">
                <span>High Score:</span>
                <span>${stats.high_score.toLocaleString()}</span>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserStats();
});
