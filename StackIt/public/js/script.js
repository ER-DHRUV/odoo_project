// StackIt JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize vote buttons
    initializeVoteButtons();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Auto-hide alerts after 5 seconds
    autoHideAlerts();
});

// Vote functionality
function initializeVoteButtons() {
    const voteButtons = document.querySelectorAll('.vote-btn');
    
    voteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (this.disabled) return;
            
            const voteType = this.dataset.type;
            const itemId = this.dataset.id;
            const target = this.dataset.target; // 'question' or 'answer'
            
            handleVote(voteType, itemId, target, this);
        });
    });
}

async function handleVote(voteType, itemId, target, button) {
    try {
        // Add loading state
        button.classList.add('loading');
        
        const response = await fetch(`/${target}s/${itemId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ voteType })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update vote count display
            const voteCountElement = target === 'question' 
                ? document.getElementById('question-vote-count')
                : document.getElementById(`answer-vote-count-${itemId}`);
            
            if (voteCountElement) {
                voteCountElement.textContent = data.voteCount;
                
                // Update color based on vote count
                voteCountElement.className = 'vote-count fw-bold my-2';
                if (data.voteCount > 0) {
                    voteCountElement.classList.add('text-success');
                } else if (data.voteCount < 0) {
                    voteCountElement.classList.add('text-danger');
                } else {
                    voteCountElement.classList.add('text-muted');
                }
            }
            
            // Show success message
            showNotification('Vote recorded successfully!', 'success');
        } else {
            showNotification(data.error || 'Error recording vote', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error recording vote. Please try again.', 'error');
    } finally {
        // Remove loading state
        button.classList.remove('loading');
    }
}

// Form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('is-invalid');
                } else {
                    field.classList.remove('is-invalid');
                }
            });
            
            // Password confirmation validation
            const password = form.querySelector('#password');
            const confirmPassword = form.querySelector('#confirmPassword');
            
            if (password && confirmPassword) {
                if (password.value !== confirmPassword.value) {
                    isValid = false;
                    confirmPassword.classList.add('is-invalid');
                    showNotification('Passwords do not match', 'error');
                } else {
                    confirmPassword.classList.remove('is-invalid');
                }
            }
            
            if (!isValid) {
                e.preventDefault();
                showNotification('Please fill in all required fields correctly', 'error');
            }
        });
    });
}

// Auto-hide alerts
function autoHideAlerts() {
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('input[name="search"]');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.length >= 3 || this.value.length === 0) {
                    this.form.submit();
                }
            }, 500);
        });
    }
}

// Tag input enhancement
function initializeTagInput() {
    const tagInput = document.querySelector('#tags');
    if (tagInput) {
        tagInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const value = this.value.trim();
                if (value) {
                    // Add tag logic here if needed
                }
            }
        });
    }
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
    initializeTagInput();
    initializeSmoothScrolling();
});

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Debounce function
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

// Export functions for global use
window.StackIt = {
    showNotification,
    formatDate,
    debounce
}; 