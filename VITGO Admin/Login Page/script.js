import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Allowed email IDs
const allowedEmails = [
    "padmapriya.r@vit.ac.in", 
    "sahildinesh.zambre2023@vitstudent.ac.in", 
    "raybanpranav.mahesh2023@vitstudent.ac.in", 
    "arye.chauhan2023@vitstudent.ac.in", 
    "akshay.mattoo2023@vitstudent.ac.in", 
    "atharva.mahesh2022@vitstudent.ac.in"
];

// DOM Elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const passwordToggle = document.getElementById("passwordToggle");
const rememberMeCheckbox = document.getElementById("rememberMe");
const modal = document.getElementById("alertModal");
const modalMessage = document.getElementById("modalMessage");
const closeModal = document.querySelector(".close");

// Enhanced UI functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeUIFeatures();
    loadRememberedEmail();
});

// Initialize UI features
function initializeUIFeatures() {
    // Password toggle functionality
    if (passwordToggle) {
        passwordToggle.addEventListener("click", togglePassword);
    }

    // Form submission
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    // Input focus effects
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('blur', handleInputBlur);
        input.addEventListener('input', handleInputChange);
    });

    // Modal close functionality
    if (closeModal) {
        closeModal.addEventListener("click", hideModal);
    }

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    // Keyboard accessibility
    document.addEventListener('keydown', handleKeyboardEvents);

    // Add smooth scrolling and animations
    addScrollAnimations();
}

// Password toggle functionality
function togglePassword() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    const icon = passwordToggle.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
    
    // Add visual feedback
    passwordToggle.style.transform = 'scale(0.9)';
    setTimeout(() => {
        passwordToggle.style.transform = 'scale(1)';
    }, 100);
}

// Handle input focus
function handleInputFocus(e) {
    const wrapper = e.target.closest('.input-wrapper');
    if (wrapper) {
        wrapper.classList.add('focused');
    }
}

// Handle input blur
function handleInputBlur(e) {
    const wrapper = e.target.closest('.input-wrapper');
    if (wrapper && !e.target.value) {
        wrapper.classList.remove('focused');
    }
}

// Handle input change
function handleInputChange(e) {
    const wrapper = e.target.closest('.input-wrapper');
    if (wrapper) {
        if (e.target.value) {
            wrapper.classList.add('has-value');
        } else {
            wrapper.classList.remove('has-value');
        }
    }
    
    // Real-time email validation
    if (e.target.type === 'email') {
        validateEmailRealTime(e.target);
    }
}

// Real-time email validation
function validateEmailRealTime(emailInput) {
    const email = emailInput.value.trim();
    const wrapper = emailInput.closest('.input-wrapper');
    
    // Remove existing validation classes
    wrapper.classList.remove('valid', 'invalid');
    
    if (email && isValidEmail(email)) {
        if (allowedEmails.includes(email)) {
            wrapper.classList.add('valid');
        } else {
            wrapper.classList.add('invalid');
        }
    }
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validate inputs
    if (!email || !password) {
        showModal("Please fill in all required fields.", "error");
        return;
    }
    
    if (!isValidEmail(email)) {
        showModal("Please enter a valid email address.", "error");
        return;
    }
    
    if (!allowedEmails.includes(email)) {
        showModal("This email is not authorized for admin access.", "error");
        return;
    }
    
    // Show loading state
    setLoginButtonLoading(true);
    
    try {
        // Attempt login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Success
        showModal("Login successful! Redirecting to dashboard...", "success");
        
        // Save email if remember me is checked
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = "../Dashboard/index.html";
        }, 2000);
        
    } catch (error) {
        console.error("Login error:", error);
        let errorMessage = "Login failed. Please try again.";
        
        // Handle specific Firebase auth errors
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = "No account found with this email address.";
                break;
            case 'auth/wrong-password':
                errorMessage = "Incorrect password. Please try again.";
                break;
            case 'auth/invalid-email':
                errorMessage = "Invalid email address format.";
                break;
            case 'auth/user-disabled':
                errorMessage = "This account has been disabled.";
                break;
            case 'auth/too-many-requests':
                errorMessage = "Too many failed attempts. Please try again later.";
                break;
            default:
                errorMessage = error.message || "An unexpected error occurred.";
        }
        
        showModal(errorMessage, "error");
        
    } finally {
        setLoginButtonLoading(false);
    }
}

// Set login button loading state
function setLoginButtonLoading(isLoading) {
    const buttonText = loginButton.querySelector('.button-text');
    const buttonLoader = loginButton.querySelector('.button-loader');
    const buttonArrow = loginButton.querySelector('.button-arrow');
    
    if (isLoading) {
        loginButton.classList.add('loading');
        loginButton.disabled = true;
        buttonText.style.opacity = '0';
        buttonArrow.style.opacity = '0';
        buttonLoader.style.display = 'block';
    } else {
        loginButton.classList.remove('loading');
        loginButton.disabled = false;
        buttonText.style.opacity = '1';
        buttonArrow.style.opacity = '1';
        buttonLoader.style.display = 'none';
    }
}

// Enhanced modal functionality
function showModal(message, type = "info") {
    const emojiContainer = modal.querySelector('.emoji-container .emoji');
    
    // Set emoji based on message type
    switch (type) {
        case 'success':
            emojiContainer.textContent = '🎉';
            break;
        case 'error':
            emojiContainer.textContent = '❌';
            break;
        case 'warning':
            emojiContainer.textContent = '⚠️';
            break;
        default:
            emojiContainer.textContent = 'ℹ️';
    }
    
    modalMessage.textContent = message;
    modal.style.display = "block";
    
    // Add entrance animation
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.animation = 'none';
    modalContent.offsetHeight; // Trigger reflow
    modalContent.style.animation = 'modalSlideIn 0.4s ease-out';
    
    // Auto-close for success messages
    if (type === 'success') {
        setTimeout(() => {
            hideModal();
        }, 3000);
    }
}

// Hide modal
function hideModal() {
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.animation = 'modalSlideOut 0.3s ease-in';
    
    setTimeout(() => {
        modal.style.display = "none";
        modalContent.style.animation = '';
    }, 300);
}

// Load remembered email
function loadRememberedEmail() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberMeCheckbox.checked = true;
        
        // Trigger input change event to update UI
        const event = new Event('input', { bubbles: true });
        emailInput.dispatchEvent(event);
    }
}

// Keyboard event handling
function handleKeyboardEvents(e) {
    // ESC key to close modal
    if (e.key === 'Escape' && modal.style.display === 'block') {
        hideModal();
    }
    
    // Enter key in email field moves to password
    if (e.key === 'Enter' && e.target === emailInput) {
        e.preventDefault();
        passwordInput.focus();
    }
}

// Add scroll animations
function addScrollAnimations() {
    // Add smooth entrance animations
    const animatedElements = document.querySelectorAll('.login-card, .nav-container');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInScale 0.8s ease-out';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user.email);
        // Could add additional user session handling here
    } else {
        console.log("User is logged out");
    }
});

// Add CSS for real-time validation
const style = document.createElement('style');
style.textContent = `
    .input-wrapper.valid .input-icon {
        color: var(--success-color) !important;
    }
    
    .input-wrapper.invalid .input-icon {
        color: var(--error-color) !important;
    }
    
    .input-wrapper.valid .form-input {
        border-color: var(--success-color) !important;
    }
    
    .input-wrapper.invalid .form-input {
        border-color: var(--error-color) !important;
    }
    
    @keyframes modalSlideOut {
        from {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        to {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
        }
    }
    
    .login-button:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }
    
    .login-button.loading {
        pointer-events: none;
    }
`;
document.head.appendChild(style);

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

