// Theme management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Language colors mapping
const languageColors = {
    'JavaScript': '#f1e05a',
    'Python': '#3572A5',
    'TypeScript': '#2b7489',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Shell': '#89e051',
    'Vue': '#2c3e50',
    'React': '#61dafb',
    'Jupyter Notebook': '#DA5B0B'
};

// GitHub API configuration
const GITHUB_USERNAME = 'multiheadattn';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

// Fetch GitHub repositories
async function fetchGitHubProjects() {
    try {
        const response = await fetch(`${GITHUB_API_URL}?sort=updated&per_page=6`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const repos = await response.json();
        renderProjects(repos);
        
    } catch (error) {
        console.error('Error fetching GitHub repositories:', error);
        handleFetchError();
    }
}

// Render projects to DOM
function renderProjects(repos) {
    const projectsContainer = document.getElementById('projects-container');
    
    if (!repos || repos.length === 0) {
        projectsContainer.innerHTML = '<div class="loading">No public repositories found.</div>';
        return;
    }

    const filteredRepos = repos
        .filter(repo => !repo.fork && repo.name !== GITHUB_USERNAME)
        .slice(0, 6);

    if (filteredRepos.length === 0) {
        projectsContainer.innerHTML = '<div class="loading">No projects to display.</div>';
        return;
    }

    const projectsHTML = filteredRepos
        .map(repo => createProjectCard(repo))
        .join('');

    projectsContainer.innerHTML = `<div class="projects-grid">${projectsHTML}</div>`;
}

// Create individual project card
function createProjectCard(repo) {
    const languageColor = languageColors[repo.language] || '#666';
    const description = repo.description || 'No description available';
    const stars = repo.stargazers_count || 0;
    
    return `
        <div class="project-card" onclick="openProject('${repo.html_url}')" role="button" tabindex="0" onkeypress="handleCardKeyPress(event, '${repo.html_url}')">
            <div class="project-title">${escapeHtml(repo.name)}</div>
            <div class="project-description">
                ${escapeHtml(description)}
            </div>
            <div class="project-meta">
                <div>
                    ${repo.language ? `<span class="language-dot" style="background-color: ${languageColor}"></span>${escapeHtml(repo.language)}` : ''}
                </div>
                <div>⭐ ${stars}</div>
            </div>
        </div>
    `;
}

// Handle project card interactions
function openProject(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

function handleCardKeyPress(event, url) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProject(url);
    }
}

// Handle fetch errors
function handleFetchError() {
    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.innerHTML = `
        <div class="loading">
            Unable to load projects. Please check back later.
            <br>
            <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" rel="noopener noreferrer">
                View on GitHub
            </a>
        </div>
    `;
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize fade-in animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                    entry.target.classList.add('fade-in');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// Handle system theme changes
function initSystemThemeListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSystemThemeListener();
    fetchGitHubProjects();
    initAnimations();
});

// Handle page visibility changes for better performance
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Refresh projects when page becomes visible (optional)
        // fetchGitHubProjects();
    }
});