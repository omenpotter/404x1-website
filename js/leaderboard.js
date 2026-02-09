// leaderboard.js - Leaderboard Integration
// Uses window.API_ENDPOINTS from auth.js (loaded first)

async function loadLeaderboard(sortBy = 'reputation_points', limit = 100) {
    try {
        const response = await fetch(`${window.API_ENDPOINTS.gameLeaderboard}?limit=${limit}&sortBy=${sortBy}`);
        const data = await response.json();

        if (data.success) {
            displayLeaderboard(data.leaderboard);
        }
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
    }
}

function displayLeaderboard(leaderboard) {
    const tbody = document.querySelector('#leaderboard-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    leaderboard.forEach(player => {
        const tr = document.createElement('tr');
        
        const currentUser = getCurrentUser();
        if (currentUser && player.username === currentUser.username) {
            tr.classList.add('current-user');
        }
        
        tr.innerHTML = `
            <td class="rank">#${player.rank}</td>
            <td class="username">${player.username}</td>
            <td class="rp">${player.reputation_points.toLocaleString()} RP</td>
            <td class="score">${player.total_score.toLocaleString()}</td>
            <td class="games">${player.games_played}</td>
            <td class="role">
                <span class="role-badge ${player.user_role}">${player.user_role}</span>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

function getCurrentUser() {
    const saved = localStorage.getItem('404x1_user');
    return saved ? JSON.parse(saved) : null;
}

document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    setInterval(() => loadLeaderboard(), 10000);
});
