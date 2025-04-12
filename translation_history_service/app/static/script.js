// DOM Elements
const translationsList = document.getElementById('translationsList');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const filterSelect = document.getElementById('filterSelect');
const sortSelect = document.getElementById('sortSelect');
const timeFilters = document.querySelectorAll('.time-filter');
const totalCount = document.getElementById('totalCount');
const enToEsCount = document.getElementById('enToEsCount');
const esToEnCount = document.getElementById('esToEnCount');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const confirmModal = document.getElementById('confirmModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');

// State
let translations = [];
let filteredTranslations = [];
let currentTimeFilter = 'all';
let currentDirectionFilter = 'all';
let currentSortOrder = 'newest';
let searchTerm = '';

// Fetch translations from the API
async function fetchTranslations() {
    try {
        const response = await fetch('/api/translations');
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        translations = await response.json();
        
        // Apply initial filters and render
        filterAndRenderTranslations();
        updateStats();
        
    } catch (error) {
        console.error('Error fetching translations:', error);
        translationsList.innerHTML = `<div class="error">Error loading translations: ${error.message}</div>`;
    }
}

// Filter and render translations
function filterAndRenderTranslations() {
    // Apply filters
    filteredTranslations = translations.filter(translation => {
        // Search term filter
        const matchesSearch = searchTerm === '' || 
            translation.original.toLowerCase().includes(searchTerm.toLowerCase()) || 
            translation.translated.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Direction filter
        let matchesDirection = true;
        if (currentDirectionFilter === 'en-es') {
            matchesDirection = translation.language?.from === 'English' && translation.language?.to === 'Spanish';
        } else if (currentDirectionFilter === 'es-en') {
            matchesDirection = translation.language?.from === 'Spanish' && translation.language?.to === 'English';
        }
        
        // Time filter
        let matchesTime = true;
        const translationDate = new Date(translation.timestamp);
        const now = new Date();
        
        if (currentTimeFilter === 'today') {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            matchesTime = translationDate >= today;
        } else if (currentTimeFilter === 'week') {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            matchesTime = translationDate >= weekStart;
        } else if (currentTimeFilter === 'month') {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            matchesTime = translationDate >= monthStart;
        }
        
        return matchesSearch && matchesDirection && matchesTime;
    });
    
    // Sort translations
    filteredTranslations.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        
        return currentSortOrder === 'newest' 
            ? dateB - dateA 
            : dateA - dateB;
    });
    
    // Render
    renderTranslations();
}

// Render translations grouped by week
function renderTranslations() {
    if (filteredTranslations.length === 0) {
        translationsList.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    // Group translations by week
    const groupedByWeek = groupTranslationsByWeek(filteredTranslations);
    
    // Generate HTML
    let html = '';
    
    for (const [weekKey, weekTranslations] of Object.entries(groupedByWeek)) {
        const weekStart = new Date(weekKey);
        const weekEnd = new Date(weekKey);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekTitle = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
        
        html += `
            <div class="week-group" data-week="${weekKey}">
                <div class="week-header">
                    <h2>${weekTitle} (${weekTranslations.length})</h2>
                    <span class="toggle-icon">▼</span>
                </div>
                <div class="week-translations">
        `;
        
        for (const translation of weekTranslations) {
            const date = new Date(translation.timestamp);
            const formattedDate = formatDateTime(date);
            
            const fromLang = translation.language?.from || 'Unknown';
            const toLang = translation.language?.to || 'Unknown';
            
            html += `
                <div class="translation-card" data-id="${translation.timestamp}">
                    <div class="translation-header">
                        <div class="translation-direction">
                            <span>${fromLang}</span>
                            <i class="fas fa-arrow-right"></i>
                            <span>${toLang}</span>
                        </div>
                        <div class="translation-actions">
                            <span class="translation-date">${formattedDate}</span>
                            <button class="delete-btn" title="Delete translation">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="translation-content">
                        <div class="translation-text">
                            <h3>Original (${fromLang})</h3>
                            <p>${escapeHtml(translation.original)}</p>
                        </div>
                        <div class="translation-text">
                            <h3>Translation (${toLang})</h3>
                            <p>${escapeHtml(translation.translated)}</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
    }
    
    translationsList.innerHTML = html;
    
    // Add event listeners to week headers
    document.querySelectorAll('.week-header').forEach(header => {
        header.addEventListener('click', () => {
            const weekGroup = header.parentElement;
            const weekTranslations = weekGroup.querySelector('.week-translations');
            
            if (weekTranslations.style.display === 'none') {
                weekTranslations.style.display = 'block';
                header.classList.remove('collapsed');
            } else {
                weekTranslations.style.display = 'none';
                header.classList.add('collapsed');
            }
        });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent event bubbling
            
            const card = button.closest('.translation-card');
            const translationId = card.dataset.id;
            
            if (confirm('Are you sure you want to delete this translation?')) {
                try {
                    const response = await fetch(`/api/translations/${translationId}`, {
                        method: 'DELETE'
                    });
                    
                    if (!response.ok) {
                        throw new Error(`API request failed with status ${response.status}`);
                    }
                    
                    // Remove the translation from the array
                    translations = translations.filter(t => t.timestamp !== translationId);
                    
                    // Re-render and update stats
                    filterAndRenderTranslations();
                    updateStats();
                    
                } catch (error) {
                    console.error('Error deleting translation:', error);
                    alert(`Error deleting translation: ${error.message}`);
                }
            }
        });
    });
}

// Group translations by week
function groupTranslationsByWeek(translations) {
    const groups = {};
    
    for (const translation of translations) {
        const date = new Date(translation.timestamp);
        const weekStart = getWeekStart(date);
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!groups[weekKey]) {
            groups[weekKey] = [];
        }
        
        groups[weekKey].push(translation);
    }
    
    return groups;
}

// Get the start of the week (Sunday) for a given date
function getWeekStart(date) {
    const result = new Date(date);
    result.setDate(date.getDate() - date.getDay());
    result.setHours(0, 0, 0, 0);
    return result;
}

// Format date as MM/DD/YYYY
function formatDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// Format date and time
function formatDateTime(date) {
    return `${formatDate(date)} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// Update statistics
function updateStats() {
    totalCount.textContent = translations.length;
    
    const enToEs = translations.filter(t => 
        t.language?.from === 'English' && t.language?.to === 'Spanish'
    ).length;
    
    const esToEn = translations.filter(t => 
        t.language?.from === 'Spanish' && t.language?.to === 'English'
    ).length;
    
    enToEsCount.textContent = enToEs;
    esToEnCount.textContent = esToEn;
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Clear all translations
async function clearAllTranslations() {
    try {
        const response = await fetch('/api/translations', {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        translations = [];
        filterAndRenderTranslations();
        updateStats();
        
        confirmModal.classList.remove('show');
        
    } catch (error) {
        console.error('Error clearing translations:', error);
        alert(`Error clearing translations: ${error.message}`);
        confirmModal.classList.remove('show');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    fetchTranslations();
    
    // Search
    searchBtn.addEventListener('click', () => {
        searchTerm = searchInput.value.trim();
        filterAndRenderTranslations();
    });
    
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchTerm = searchInput.value.trim();
            filterAndRenderTranslations();
        }
    });
    
    // Filter by direction
    filterSelect.addEventListener('change', () => {
        currentDirectionFilter = filterSelect.value;
        filterAndRenderTranslations();
    });
    
    // Sort order
    sortSelect.addEventListener('change', () => {
        currentSortOrder = sortSelect.value;
        filterAndRenderTranslations();
    });
    
    // Time filters
    timeFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            timeFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            currentTimeFilter = filter.dataset.filter;
            filterAndRenderTranslations();
        });
    });
    
    // Clear history
    clearHistoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        confirmModal.classList.add('show');
    });
    
    cancelDelete.addEventListener('click', () => {
        confirmModal.classList.remove('show');
    });
    
    confirmDelete.addEventListener('click', clearAllTranslations);
    
    // Close modal when clicking outside
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            confirmModal.classList.remove('show');
        }
    });
});
