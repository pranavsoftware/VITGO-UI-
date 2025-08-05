// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    databaseURL: "https://easycab-71fcf-default-rtdb.firebaseio.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Global variables for scanning state
let isScanning = false;
let scanningInterval = null;

// DOM Elements
document.addEventListener('DOMContentLoaded', async () => {
    const loginToggle = document.getElementById('login-toggle');
    const registerToggle = document.getElementById('register-toggle');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginScanBtn = document.getElementById('login-scan-btn');
    const registerScanBtn = document.getElementById('register-scan-btn');
    const loginVideo = document.getElementById('login-video');
    const registerVideo = document.getElementById('register-video');
    const loginCanvas = document.getElementById('login-canvas');
    const registerCanvas = document.getElementById('register-canvas');
    const loginStatus = document.getElementById('login-status');
    const registerStatus = document.getElementById('register-status');
    const loginScanningOverlay = document.getElementById('login-scanning-overlay');
    const registerScanningOverlay = document.getElementById('register-scanning-overlay');

    // Detection Options using TinyYolov2
    const detectionOptions = new faceapi.TinyYolov2Options({
        inputSize: 416,
        scoreThreshold: 0.5
    });

    // Load face-api.js models
    await loadFaceApiModels();

    // Toggle Event Listeners
    loginToggle.addEventListener('click', () => {
        toggleForms('login');
        updateToggleStyles(loginToggle, registerToggle);
    });

    registerToggle.addEventListener('click', () => {
        toggleForms('register');
        updateToggleStyles(registerToggle, loginToggle);
    });

    loginScanBtn.addEventListener('click', async () => {
        await handleFaceScan(loginVideo, loginScanBtn, loginStatus, loginScanningOverlay, 'login');
    });

    registerScanBtn.addEventListener('click', async () => {
        await handleFaceScan(registerVideo, registerScanBtn, registerStatus, registerScanningOverlay, 'register');
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegister();
    });

    // Update toggle button styles
    function updateToggleStyles(activeBtn, inactiveBtn) {
        activeBtn.classList.add('active');
        inactiveBtn.classList.remove('active');
    }

    // Toggle Login/Register Forms with animation
    function toggleForms(formType) {
        if (formType === 'login') {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        } else {
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        }
    }

    // Enhanced face scanning with 3D animations
    async function handleFaceScan(videoElement, scanBtn, statusElement, overlayElement, scanType) {
        if (isScanning) {
            stopScanning(videoElement, scanBtn, overlayElement);
            return;
        }

        try {
            // Update UI for scanning state
            updateScanningUI(scanBtn, statusElement, overlayElement, true);
            
            // Start video stream
            await startVideoStream(videoElement);
            
            // Wait a moment for video to initialize
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Start scanning animation and detection
            await startFaceDetection(videoElement, statusElement, overlayElement, scanType);
            
        } catch (error) {
            console.error('Face scanning error:', error);
            updateStatusMessage(statusElement, 'Camera access denied. Please allow camera permissions.', 'error');
            stopScanning(videoElement, scanBtn, overlayElement);
        }
    }

    // Update scanning UI
    function updateScanningUI(scanBtn, statusElement, overlayElement, isActive) {
        if (isActive) {
            scanBtn.textContent = '⏹️ Stop Scanning';
            scanBtn.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
            overlayElement.style.display = 'block';
            updateStatusMessage(statusElement, '📷 Position your face in the camera view...', 'processing');
            isScanning = true;
        } else {
            scanBtn.textContent = '📷 Start Face Scan';
            scanBtn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
            overlayElement.style.display = 'none';
            isScanning = false;
        }
    }

    // Start face detection with enhanced feedback
    async function startFaceDetection(videoElement, statusElement, overlayElement, scanType) {
        let detectionAttempts = 0;
        const maxAttempts = 50; // 10 seconds at 200ms intervals
        
        scanningInterval = setInterval(async () => {
            if (!isScanning) {
                clearInterval(scanningInterval);
                return;
            }
            
            detectionAttempts++;
            
            try {
                const detections = await faceapi.detectSingleFace(videoElement, detectionOptions)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detections) {
                    // Face detected - capture and process
                    clearInterval(scanningInterval);
                    await processFaceDetection(videoElement, statusElement, overlayElement, detections, scanType);
                } else if (detectionAttempts >= maxAttempts) {
                    // Timeout
                    clearInterval(scanningInterval);
                    updateStatusMessage(statusElement, '⏰ Scan timeout. Please try again with better lighting.', 'error');
                    stopScanning(videoElement, document.getElementById(`${scanType}-scan-btn`), overlayElement);
                }
            } catch (error) {
                console.error('Detection error:', error);
            }
        }, 200);
    }

    // Process face detection
    async function processFaceDetection(videoElement, statusElement, overlayElement, detections, scanType) {
        updateStatusMessage(statusElement, '✅ Face detected! Processing biometric data...', 'processing');
        
        // Add success animation
        overlayElement.style.borderColor = '#00ff88';
        overlayElement.style.boxShadow = '0 0 30px #00ff88';
        
        // Capture face data
        const faceImage = await captureFaceData(videoElement, detections);
        
        if (faceImage) {
            updateStatusMessage(statusElement, '🎉 Face capture successful! Biometric data secured.', 'success');
            
            // Store the captured face data
            if (scanType === 'login') {
                window.capturedLoginFace = faceImage;
            } else {
                window.capturedRegisterFace = faceImage;
            }
            
            // Stop scanning
            setTimeout(() => {
                stopScanning(videoElement, document.getElementById(`${scanType}-scan-btn`), overlayElement);
            }, 2000);
        } else {
            updateStatusMessage(statusElement, '❌ Face capture failed. Please try again.', 'error');
            stopScanning(videoElement, document.getElementById(`${scanType}-scan-btn`), overlayElement);
        }
    }

    // Stop scanning
    function stopScanning(videoElement, scanBtn, overlayElement) {
        isScanning = false;
        if (scanningInterval) {
            clearInterval(scanningInterval);
            scanningInterval = null;
        }
        
        updateScanningUI(scanBtn, null, overlayElement, false);
        stopVideoStream(videoElement);
    }

    // Update status message with styling
    function updateStatusMessage(statusElement, message, type) {
        statusElement.textContent = message;
        statusElement.className = `status-message status-${type}`;
        
        if (type === 'processing') {
            statusElement.innerHTML = '<div class="loading-spinner"></div>' + message;
        }
    }

    // Start Video Stream with enhanced error handling
    async function startVideoStream(videoElement) {
        try {
            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30 },
                    facingMode: 'user'
                }
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = stream;
            
            return new Promise((resolve) => {
                videoElement.onloadedmetadata = () => {
                    videoElement.play();
                    resolve();
                };
            });
        } catch (error) {
            console.error('Webcam access error:', error);
            throw new Error('Camera access denied. Please check your camera permissions.');
        }
    }

    // Stop Video Stream
    function stopVideoStream(videoElement) {
        const stream = videoElement.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
            });
            videoElement.srcObject = null;
        }
    }

    // Load face-api.js Models with progress indication
    async function loadFaceApiModels() {
        const MODEL_URL = './models/face-api.js/weights';
        try {
            console.log('Loading AI models...');
            await Promise.all([
                faceapi.nets.tinyYolov2.loadFromUri(MODEL_URL),
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            console.log('AI models loaded successfully');
        } catch (error) {
            console.error('Error loading face-api.js models:', error);
            alert('Failed to load AI models. Some features may not work properly.');
        }
    }

    // Validate Email Domain
    function validateEmailDomain(email) {
        const validDomains = ['@vit.ac.in', '@vitstudent.ac.in'];
        return validDomains.some(domain => email.toLowerCase().endsWith(domain));
    }

    // Enhanced Registration Handler
    async function handleRegister() {
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim().toLowerCase();
        const password = document.getElementById('register-password').value;
        const termsAccepted = document.getElementById('terms').checked;

        // Validation
        if (!name || name.length < 2) {
            updateStatusMessage(registerStatus, '❌ Please enter a valid name (at least 2 characters).', 'error');
            return;
        }

        if (!validateEmailDomain(email)) {
            updateStatusMessage(registerStatus, '❌ Please use a valid VIT email address (@vit.ac.in or @vitstudent.ac.in).', 'error');
            return;
        }

        if (password.length < 6) {
            updateStatusMessage(registerStatus, '❌ Password must be at least 6 characters long.', 'error');
            return;
        }

        if (!termsAccepted) {
            updateStatusMessage(registerStatus, '❌ Please accept the terms and conditions.', 'error');
            return;
        }

        if (!window.capturedRegisterFace) {
            updateStatusMessage(registerStatus, '❌ Please complete face scanning before registration.', 'error');
            return;
        }

        try {
            updateStatusMessage(registerStatus, '🔄 Creating your account...', 'processing');

            // Create Firebase user
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Send email verification
            await user.sendEmailVerification();

            // Save user data to Firestore
            await db.collection("users").doc(user.uid).set({
                name: name,
                email: email,
                faceScan: window.capturedRegisterFace,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                emailVerified: false
            });

            // Send welcome email (if server is available)
            try {
                await fetch('http://localhost:5500/send-welcome-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, name })
                });
            } catch (emailError) {
                console.warn('Welcome email service unavailable:', emailError);
            }

            updateStatusMessage(registerStatus, '🎉 Registration successful! Please check your email for verification.', 'success');
            
            // Reset form
            registerForm.reset();
            window.capturedRegisterFace = null;
            
            // Switch to login form after 3 seconds
            setTimeout(() => {
                toggleForms('login');
                updateButtonStyles(loginBtn, registerBtn);
            }, 3000);

        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = '❌ Registration failed. ';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage += 'This email is already registered.';
                    break;
                case 'auth/weak-password':
                    errorMessage += 'Password is too weak.';
                    break;
                case 'auth/invalid-email':
                    errorMessage += 'Invalid email format.';
                    break;
                default:
                    errorMessage += error.message;
            }
            
            updateStatusMessage(registerStatus, errorMessage, 'error');
        }
    }

    // Enhanced Login Handler
    async function handleLogin() {
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;

        // Validation
        if (!validateEmailDomain(email)) {
            updateStatusMessage(loginStatus, '❌ Please use a valid VIT email address.', 'error');
            return;
        }

        if (!window.capturedLoginFace) {
            updateStatusMessage(loginStatus, '❌ Please complete face scanning before login.', 'error');
            return;
        }

        try {
            updateStatusMessage(loginStatus, '🔄 Authenticating...', 'processing');

            // Sign in with email and password
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Check email verification
            if (!user.emailVerified) {
                updateStatusMessage(loginStatus, '❌ Please verify your email before logging in.', 'error');
                await auth.signOut();
                return;
            }

            updateStatusMessage(loginStatus, '🔄 Verifying biometric data...', 'processing');

            // Get stored face data
            const userDoc = await db.collection("users").doc(user.uid).get();
            if (!userDoc.exists) {
                updateStatusMessage(loginStatus, '❌ User data not found. Please register again.', 'error');
                await auth.signOut();
                return;
            }

            const userData = userDoc.data();
            const storedFaceScan = userData.faceScan;

            if (!storedFaceScan) {
                updateStatusMessage(loginStatus, '❌ Face data not found. Please register again.', 'error');
                await auth.signOut();
                return;
            }

            // Compare faces
            const isMatch = await compareFaces(window.capturedLoginFace, storedFaceScan);
            
            if (!isMatch) {
                updateStatusMessage(loginStatus, '❌ Face verification failed. Access denied.', 'error');
                await auth.signOut();
                return;
            }

            // Success - redirect to dashboard
            updateStatusMessage(loginStatus, '🎉 Authentication successful! Redirecting...', 'success');
            
            // Update last login
            await db.collection("users").doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            setTimeout(() => {
                window.location.href = '../VITGO VITian/dashboard/';
            }, 2000);

        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = '❌ Login failed. ';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage += 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage += 'Incorrect password.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage += 'Too many failed attempts. Please try again later.';
                    break;
                default:
                    errorMessage += error.message;
            }
            
            updateStatusMessage(loginStatus, errorMessage, 'error');
        }
    }

    // Enhanced Face Capture with better processing
    async function captureFaceData(videoElement, detections) {
        try {
            // Create high-quality capture canvas
            const captureCanvas = document.createElement('canvas');
            const displaySize = { width: videoElement.videoWidth, height: videoElement.videoHeight };
            
            captureCanvas.width = displaySize.width;
            captureCanvas.height = displaySize.height;
            
            const captureCtx = captureCanvas.getContext('2d');
            
            // Draw the video frame
            captureCtx.drawImage(videoElement, 0, 0, displaySize.width, displaySize.height);
            
            // Draw face detection box for visual feedback
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            faceapi.draw.drawDetections(captureCanvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(captureCanvas, resizedDetections);
            
            // Convert to high-quality image data
            const dataURL = captureCanvas.toDataURL('image/jpeg', 0.95);
            
            return dataURL;
        } catch (error) {
            console.error('Face capture error:', error);
            return null;
        }
    }

    // Enhanced Face Comparison with better accuracy
    async function compareFaces(capturedFace, storedFaceScan) {
        try {
            // Load images
            const capturedImage = await faceapi.fetchImage(capturedFace);
            const storedImage = await faceapi.fetchImage(storedFaceScan);

            // Get face descriptors with improved detection
            const capturedDescriptor = await faceapi.detectSingleFace(capturedImage, detectionOptions)
                .withFaceLandmarks()
                .withFaceDescriptor();

            const storedDescriptor = await faceapi.detectSingleFace(storedImage, detectionOptions)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (capturedDescriptor && storedDescriptor) {
                // Calculate face similarity
                const distance = faceapi.euclideanDistance(
                    capturedDescriptor.descriptor, 
                    storedDescriptor.descriptor
                );
                
                // More lenient threshold for better user experience
                const threshold = 0.65;
                const similarity = Math.max(0, (1 - distance)) * 100;
                
                console.log(`Face similarity: ${similarity.toFixed(2)}%`);
                console.log(`Distance: ${distance.toFixed(4)}, Threshold: ${threshold}`);
                
                return distance < threshold;
            }
        } catch (error) {
            console.error('Face comparison error:', error);
            return false;
        }
        return false;
    }

    // Legacy function for backward compatibility
    async function captureFace(videoElement, canvasElement, statusElement) {
        try {
            updateStatusMessage(statusElement, '🔄 Processing face data...', 'processing');

            const detections = await faceapi.detectSingleFace(videoElement, detectionOptions)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detections) {
                const faceImage = await captureFaceData(videoElement, detections);
                if (faceImage) {
                    updateStatusMessage(statusElement, '✅ Face captured successfully!', 'success');
                    return faceImage;
                }
            }
            
            updateStatusMessage(statusElement, '❌ No face detected. Please ensure good lighting and face the camera.', 'error');
            return null;
        } catch (error) {
            console.error('Legacy face capture error:', error);
            updateStatusMessage(statusElement, '❌ Face detection error. Please try again.', 'error');
            return null;
        }
    }
});

// Firebase Authentication State Management
auth.onAuthStateChanged(async (user) => {
    if (user && user.emailVerified) {
        console.log('✅ User authenticated:', user.email);
        // Optional: Add dashboard redirect logic if needed
    } else if (user && !user.emailVerified) {
        console.log('⚠️ User email not verified:', user.email);
    } else {
        console.log('🔓 No authenticated user');
    }
});

// Enhanced Modal Management
document.addEventListener('DOMContentLoaded', () => {
    const videoModal = document.getElementById('videoModal');
    const instructionVideoBtn = document.getElementById('instruction-video-btn');
    const closeModal = document.getElementsByClassName('close')[0];
    const video = document.getElementById('instruction-video');

    // Enhanced modal close function
    function closeModalAndResetVideo() {
        videoModal.style.display = "none";
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
        // Remove any backdrop blur
        document.body.style.overflow = 'auto';
    }

    // Enhanced modal open function
    function openModal() {
        videoModal.style.display = "block";
        document.body.style.overflow = 'hidden';
        
        // Add entrance animation
        videoModal.style.opacity = '0';
        setTimeout(() => {
            videoModal.style.opacity = '1';
        }, 10);
    }

    // Event listeners
    if (instructionVideoBtn) {
        instructionVideoBtn.addEventListener('click', openModal);
    }

    if (closeModal) {
        closeModal.addEventListener('click', closeModalAndResetVideo);
    }

    // Enhanced outside click detection
    window.addEventListener('click', (event) => {
        if (event.target === videoModal) {
            closeModalAndResetVideo();
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && videoModal.style.display === 'block') {
            closeModalAndResetVideo();
        }
    });
});

// Service Worker Registration (Enhanced)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('../VITian/service-worker.js')
            .then((registration) => {
                console.log('✅ Service Worker registered successfully:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 New service worker available');
                });
            })
            .catch((error) => {
                console.warn('❌ Service Worker registration failed:', error);
            });
    });
}

// Enhanced Error Handling and User Experience
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Show user-friendly error message for critical errors
    if (event.error.message.includes('face-api') || event.error.message.includes('firebase')) {
        const errorBanner = document.createElement('div');
        errorBanner.className = 'error-banner';
        errorBanner.innerHTML = `
            <div style="background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 15px; border-radius: 10px; margin: 20px; text-align: center;">
                ⚠️ System Error: Some features may not work properly. Please refresh the page.
                <button onclick="location.reload()" style="margin-left: 10px; padding: 5px 15px; background: white; color: #dc3545; border: none; border-radius: 5px; cursor: pointer;">
                    🔄 Refresh Page
                </button>
            </div>
        `;
        document.body.insertBefore(errorBanner, document.body.firstChild);
    }
});

// Performance Monitoring
window.addEventListener('load', () => {
    // Log performance metrics
    if (window.performance && window.performance.timing) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`📊 Page load time: ${loadTime}ms`);
    }
});

// Accessibility Enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard navigation for buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                button.click();
            }
        });
    });

    // Add focus indicators for better accessibility
    const focusableElements = document.querySelectorAll('button, input, a');
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '3px solid rgba(102, 126, 234, 0.5)';
            element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = '';
            element.style.outlineOffset = '';
        });
    });
});

// Network Status Monitoring
window.addEventListener('online', () => {
    console.log('🌐 Network connection restored');
    const offlineBanner = document.querySelector('.offline-banner');
    if (offlineBanner) {
        offlineBanner.remove();
    }
});

window.addEventListener('offline', () => {
    console.log('🚫 Network connection lost');
    const offlineBanner = document.createElement('div');
    offlineBanner.className = 'offline-banner';
    offlineBanner.innerHTML = `
        <div style="background: linear-gradient(135deg, #ffc107, #fd7e14); color: #2c3e50; padding: 15px; text-align: center; font-weight: 600;">
            📡 No internet connection. Some features may not work properly.
        </div>
    `;
    document.body.insertBefore(offlineBanner, document.body.firstChild);
});