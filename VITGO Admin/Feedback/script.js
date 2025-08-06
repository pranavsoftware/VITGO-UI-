// VITGO Admin Feedback - Modern JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    initializeNavigation();
    initializeFeedbackSystem();
    initializeFilters();
    initializeModals();
    loadFeedbackData();
    initializeAnimations();
}

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on nav items
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Feedback system functionality
function initializeFeedbackSystem() {
    // Initialize feedback statistics
    updateFeedbackStats();
    
    // Setup feedback card interactions
    setupFeedbackCards();
    
    // Initialize action buttons
    initializeActionButtons();
}

// Filter functionality
function initializeFilters() {
    const filterInputs = document.querySelectorAll('.control-input, .control-select');
    
    filterInputs.forEach(input => {
        input.addEventListener('change', debounce(applyFilters, 300));
        input.addEventListener('input', debounce(applyFilters, 300));
    });
    
    // Clear filters button
    const clearFiltersBtn = document.querySelector('.btn-outline');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
    
    // Export functionality
    const exportBtn = document.querySelector('.btn-primary');
    if (exportBtn && exportBtn.textContent.includes('Export')) {
        exportBtn.addEventListener('click', exportFeedback);
    }
}

// Modal functionality
function initializeModals() {
    // Initialize all modals
    document.querySelectorAll('.modal').forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }
        
        if (overlay) {
            overlay.addEventListener('click', () => closeModal(modal));
        }
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
}

// Load and display feedback data
function loadFeedbackData() {
    showLoading(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
        const mockFeedback = generateMockFeedback();
        displayFeedback(mockFeedback);
        updateFeedbackStats(mockFeedback);
        showLoading(false);
    }, 1000);
}

// Generate mock feedback data
function generateMockFeedback() {
    const subjects = [
        'Excellent Service', 'Late Pickup', 'Driver Behavior', 'App Issues',
        'Route Suggestion', 'Payment Problem', 'Vehicle Condition', 'General Feedback'
    ];
    
    const statuses = ['new', 'pending', 'resolved'];
    const names = ['Rajesh Kumar', 'Priya Singh', 'Amit Sharma', 'Sneha Patel', 'Vikram Rao'];
    
    const feedback = [];
    
    for (let i = 0; i < 12; i++) {
        const name = names[Math.floor(Math.random() * names.length)];
        const rating = Math.floor(Math.random() * 5) + 1;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        
        feedback.push({
            id: i + 1,
            name: name,
            email: `${name.toLowerCase().replace(' ', '.')}@vit.ac.in`,
            subject: subject,
            message: generateFeedbackMessage(subject, rating),
            rating: rating,
            status: status,
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            category: Math.random() > 0.5 ? 'service' : 'app'
        });
    }
    
    return feedback;
}

// Generate realistic feedback messages
function generateFeedbackMessage(subject, rating) {
    const messages = {
        'Excellent Service': 'The driver was very professional and the cab was clean. Highly recommend!',
        'Late Pickup': 'The cab arrived 15 minutes late which caused some inconvenience.',
        'Driver Behavior': 'The driver was not following traffic rules and was driving rashly.',
        'App Issues': 'The app keeps crashing when I try to book a ride.',
        'Route Suggestion': 'The suggested route was not optimal and took longer than expected.',
        'Payment Problem': 'Having issues with payment processing through the app.',
        'Vehicle Condition': 'The vehicle was not well maintained and had cleanliness issues.',
        'General Feedback': 'Overall good experience with the service. Keep it up!'
    };
    
    return messages[subject] || 'Thank you for your feedback.';
}

// Display feedback in the grid
function displayFeedback(feedbackData) {
    const grid = document.querySelector('.feedback-grid');
    if (!grid) return;
    
    if (feedbackData.length === 0) {
        showEmptyState(grid);
        return;
    }
    
    grid.innerHTML = feedbackData.map(feedback => createFeedbackCard(feedback)).join('');
    
    // Add click listeners to feedback cards
    setupFeedbackCards();
}

// Create a feedback card HTML
function createFeedbackCard(feedback) {
    const stars = generateStarRating(feedback.rating);
    const statusClass = `status-${feedback.status}`;
    const initial = feedback.name.charAt(0).toUpperCase();
    const formattedDate = new Date(feedback.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    
    return `
        <div class="feedback-card fade-in" data-id="${feedback.id}" onclick="openFeedbackModal(${feedback.id})">
            <div class="feedback-header">
                <div class="user-info">
                    <div class="user-avatar">${initial}</div>
                    <div class="user-details">
                        <h4>${feedback.name}</h4>
                        <span class="user-email">${feedback.email}</span>
                    </div>
                </div>
                <div class="feedback-rating">
                    ${stars}
                </div>
            </div>
            <div class="feedback-content">
                <div class="feedback-subject">${feedback.subject}</div>
                <div class="feedback-text">${feedback.message}</div>
            </div>
            <div class="feedback-footer">
                <div class="feedback-date">
                    <i class="fas fa-calendar-alt"></i>
                    ${formattedDate}
                </div>
                <span class="feedback-status ${statusClass}">${feedback.status}</span>
            </div>
        </div>
    `;
}

// Generate star rating HTML
function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star star"></i>';
        } else {
            stars += '<i class="far fa-star star empty"></i>';
        }
    }
    return stars;
}

// Setup feedback card interactions
function setupFeedbackCards() {
    document.querySelectorAll('.feedback-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Open feedback detail modal
function openFeedbackModal(feedbackId) {
    const modal = document.getElementById('feedbackModal');
    if (!modal) return;
    
    // Get feedback data (in real app, fetch from API)
    const feedback = getCurrentFeedbackData().find(f => f.id === feedbackId);
    if (!feedback) return;
    
    // Populate modal with feedback details
    populateFeedbackModal(feedback);
    
    // Show modal
    showModal(modal);
}

// Populate feedback modal with data
function populateFeedbackModal(feedback) {
    const modal = document.getElementById('feedbackModal');
    if (!modal) return;
    
    const modalBody = modal.querySelector('.modal-body');
    const stars = generateStarRating(feedback.rating);
    const formattedDate = new Date(feedback.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    modalBody.innerHTML = `
        <div class="feedback-detail">
            <div class="detail-section">
                <h4><i class="fas fa-user"></i> User Information</h4>
                <p><strong>Name:</strong> ${feedback.name}</p>
                <p><strong>Email:</strong> ${feedback.email}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-star"></i> Rating & Subject</h4>
                <div class="rating-display">
                    <div class="rating-stars">${stars}</div>
                    <span class="rating-text">${feedback.rating}/5</span>
                </div>
                <p><strong>Subject:</strong> ${feedback.subject}</p>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-comment"></i> Feedback Message</h4>
                <p>${feedback.message}</p>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-cog"></i> Actions</h4>
                <div class="modal-actions">
                    <select class="control-select" id="statusSelect">
                        <option value="new" ${feedback.status === 'new' ? 'selected' : ''}>New</option>
                        <option value="pending" ${feedback.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="resolved" ${feedback.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                    <button class="btn btn-primary" onclick="updateFeedbackStatus(${feedback.id})">
                        <i class="fas fa-save"></i> Update Status
                    </button>
                    <button class="btn btn-outline" onclick="sendResponse(${feedback.id})">
                        <i class="fas fa-reply"></i> Send Response
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Update feedback statistics
function updateFeedbackStats(feedbackData = null) {
    if (!feedbackData) {
        feedbackData = getCurrentFeedbackData();
    }
    
    const totalFeedback = feedbackData.length;
    const newFeedback = feedbackData.filter(f => f.status === 'new').length;
    const avgRating = feedbackData.reduce((sum, f) => sum + f.rating, 0) / totalFeedback || 0;
    
    // Update stats in header
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 3) {
        statCards[0].querySelector('.stat-number').textContent = totalFeedback;
        statCards[1].querySelector('.stat-number').textContent = newFeedback;
        statCards[2].querySelector('.stat-number').textContent = avgRating.toFixed(1);
    }
}

// Apply filters to feedback data
function applyFilters() {
    const filterStatus = document.getElementById('filterStatus')?.value || '';
    const filterRating = document.getElementById('filterRating')?.value || '';
    const filterDate = document.getElementById('filterDate')?.value || '';
    const searchInput = document.getElementById('searchInput')?.value || '';
    
    let filteredData = getCurrentFeedbackData();
    
    // Apply status filter
    if (filterStatus) {
        filteredData = filteredData.filter(f => f.status === filterStatus);
    }
    
    // Apply rating filter
    if (filterRating) {
        filteredData = filteredData.filter(f => f.rating >= parseInt(filterRating));
    }
    
    // Apply search filter
    if (searchInput) {
        const search = searchInput.toLowerCase();
        filteredData = filteredData.filter(f => 
            f.name.toLowerCase().includes(search) ||
            f.subject.toLowerCase().includes(search) ||
            f.message.toLowerCase().includes(search)
        );
    }
    
    // Apply date filter
    if (filterDate) {
        const today = new Date();
        const filterDays = parseInt(filterDate);
        const cutoffDate = new Date(today.getTime() - filterDays * 24 * 60 * 60 * 1000);
        filteredData = filteredData.filter(f => new Date(f.date) >= cutoffDate);
    }
    
    displayFeedback(filteredData);
}

// Clear all filters
function clearAllFilters() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterRating').value = '';
    document.getElementById('filterDate').value = '';
    document.getElementById('searchInput').value = '';
    
    displayFeedback(getCurrentFeedbackData());
}

// Export feedback data
function exportFeedback() {
    const data = getCurrentFeedbackData();
    const csv = convertToCSV(data);
    downloadCSV(csv, 'feedback-export.csv');
}

// Convert data to CSV format
function convertToCSV(data) {
    const headers = ['ID', 'Name', 'Email', 'Subject', 'Message', 'Rating', 'Status', 'Date'];
    const csvContent = [
        headers.join(','),
        ...data.map(row => [
            row.id,
            `"${row.name}"`,
            row.email,
            `"${row.subject}"`,
            `"${row.message.replace(/"/g, '""')}"`,
            row.rating,
            row.status,
            new Date(row.date).toLocaleDateString()
        ].join(','))
    ].join('\n');
    
    return csvContent;
}

// Download CSV file
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Show/hide loading state
function showLoading(show) {
    const loading = document.querySelector('.loading-overlay');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}

// Show empty state
function showEmptyState(container) {
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">
                <i class="far fa-comments"></i>
            </div>
            <h3>No Feedback Found</h3>
            <p>No feedback matches your current filters. Try adjusting your search criteria.</p>
            <button class="btn btn-primary" onclick="clearAllFilters()">Clear Filters</button>
        </div>
    `;
}

// Modal functions
function showModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Initialize action buttons
function initializeActionButtons() {
    // Refresh button
    const refreshBtn = document.querySelector('.btn-outline');
    if (refreshBtn && refreshBtn.textContent.includes('Refresh')) {
        refreshBtn.addEventListener('click', () => {
            loadFeedbackData();
            showToast('Feedback data refreshed!');
        });
    }
}

// Update feedback status
function updateFeedbackStatus(feedbackId) {
    const statusSelect = document.getElementById('statusSelect');
    const newStatus = statusSelect.value;
    
    // In a real app, make API call to update status
    console.log(`Updating feedback ${feedbackId} status to ${newStatus}`);
    
    // Update local data
    const data = getCurrentFeedbackData();
    const feedback = data.find(f => f.id === feedbackId);
    if (feedback) {
        feedback.status = newStatus;
        displayFeedback(data);
        updateFeedbackStats(data);
    }
    
    showToast('Feedback status updated successfully!');
    closeModal(document.getElementById('feedbackModal'));
}

// Send response to feedback
function sendResponse(feedbackId) {
    // In a real app, open email client or response modal
    console.log(`Sending response to feedback ${feedbackId}`);
    showToast('Response feature will be implemented soon!');
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Initialize animations
function initializeAnimations() {
    // Observe elements for animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all animatable elements
    document.querySelectorAll('.feedback-card, .stat-card, .controls-section').forEach(el => {
        observer.observe(el);
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getCurrentFeedbackData() {
    // In a real app, this would fetch from a global state or API
    return window.currentFeedbackData || [];
}

// Store feedback data globally for easy access
window.currentFeedbackData = [];

// Toast styles
const toastStyles = `
    .toast {
        position: fixed;
        top: 90px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 4000;
        font-weight: 500;
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast i {
        font-size: 1.1rem;
    }
`;

// Add toast styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = toastStyles;
document.head.appendChild(styleSheet);
