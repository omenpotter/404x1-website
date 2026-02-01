// Leaderboard tab functionality
const categoryTabs = document.querySelectorAll('.category-tab');
const leaderboardContents = document.querySelectorAll('.leaderboard-content');

categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const category = tab.getAttribute('data-category');
        
        // Update active tab
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding content
        leaderboardContents.forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(`${category}Leaderboard`) || 
                             document.getElementById('rewardsSection');
        if (targetContent) {
            targetContent.classList.add('active');
        }
    });
});

// Load user progress from localStorage
function loadUserProgress() {
    const userData = localStorage.getItem('404x1_auth');
    if (userData) {
        const user = JSON.parse(userData);
        
        // Update milestones based on user RP
        updateMilestones(user.rp || 0);
        
        // You can add more user-specific progress updates here
    }
}

function updateMilestones(userRP) {
    const milestones = [100, 500, 10000, 50000];
    const milestoneItems = document.querySelectorAll('.milestone-item');
    
    milestoneItems.forEach((item, index) => {
        const badge = item.querySelector('.milestone-badge');
        if (userRP >= milestones[index]) {
            badge.classList.remove('locked');
        }
    });
}

// Animate table rows on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const tableRowObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }, index * 100);
            tableRowObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Apply animation to table rows
document.querySelectorAll('.table-row').forEach(row => {
    row.style.opacity = '0';
    row.style.transform = 'translateX(-20px)';
    row.style.transition = 'all 0.5s ease';
    tableRowObserver.observe(row);
});

// Initialize
loadUserProgress();

// Update leaderboard data periodically (connect to backend)
function updateLeaderboardData() {
    // This would fetch real data from your backend
    console.log('Leaderboard data update placeholder');
}

// Update every 30 seconds
setInterval(updateLeaderboardData, 30000);
