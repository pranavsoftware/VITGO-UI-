import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, getDoc, serverTimestamp, orderBy, deleteDoc, query } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Allowed email IDs
const allowedEmails = [
    "padmapriya.r@vit.ac.in",
    "raybanpranav.mahesh2023@vitstudent.ac.in",
    "arye.chauhan2023@vitstudent.ac.in",
    "akshay.mattoo2023@vitstudent.ac.in",
    "sahildinesh.zambre2023@vitstudent.ac.in",
    "atharva.mahesh2022@vitstudent.ac.in"
];

// Select the notice form and spinner element
const noticeForm = document.getElementById("notice-form");
const spinner = document.getElementById("spinner");

// Global variable to store current user info
let currentUser = null;

// Display username and profile picture in the header
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Check if user email is allowed
        if (!allowedEmails.includes(user.email)) {
            alert("You do not have access to this page.");
            window.location = 'https://vitadmin.easycab.site/';
            return;
        }

        currentUser = user; // Store current user globally

        // Fetch user data from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            // Display username
            document.getElementById("name").textContent = userData.name || user.email.split('@')[0];
            // Display faceScan image
            document.getElementById("profile-pic").src = userData.faceScan || 'default-profile.png';
        } else {
            console.error("No such user document!");
            document.getElementById("profile-pic").src = 'default-profile.png';
        }
        
        // Load notices after user authentication
        loadNotices();
    } else {
        window.location = 'https://vitadmin.easycab.site/';
    }
});

// Logout function
document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.replace('https://vitadmin.easycab.site/');
    }).catch((error) => {
        console.error("Error signing out: ", error);
    });
});

// Show loading state for buttons
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.style.opacity = '0.6';
        button.style.cursor = 'not-allowed';
    } else {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
}

// Show success/error messages
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Posting notices
noticeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const noticeText = document.getElementById("notice-text").value.trim();
    const userName = document.getElementById("name").textContent;
    const submitBtn = noticeForm.querySelector('button[type="submit"]');

    if (!noticeText) {
        showMessage("Please enter a notice text", 'error');
        return;
    }

    setButtonLoading(submitBtn, true);

    try {
        await addDoc(collection(db, "notices"), {
            text: noticeText,
            username: userName,
            userId: currentUser.uid, // Store user ID for better security
            createdAt: serverTimestamp(),
            editedAt: null
        });
        
        noticeForm.reset();
        showMessage("Notice posted successfully!");
        loadNotices();
    } catch (error) {
        console.error("Error adding notice: ", error);
        showMessage("Error posting notice. Please try again.", 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
});

// Load notices from Firestore
async function loadNotices() {
    const noticesContainer = document.getElementById("notices");
    noticesContainer.innerHTML = '';
    spinner.style.visibility = 'visible';

    try {
        // Query to get notices ordered by createdAt in descending order
        const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            noticesContainer.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No notices yet. Be the first to post one!</p>';
            return;
        }

        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const noticeDiv = document.createElement("div");
            noticeDiv.classList.add("notice");
            
            // Check if current user is the author of this notice
            const isAuthor = currentUser && (data.userId === currentUser.uid || data.username === document.getElementById("name").textContent);
            
            noticeDiv.innerHTML = `
                <div class="notice-header">
                    <h4>Posted by: ${data.username}</h4>
                    <div class="notice-actions">
                        ${isAuthor ? `
                            <button class="edit-btn" data-id="${docSnapshot.id}" title="Edit notice">
                                ✏️ Edit
                            </button>
                            <button class="delete-btn" data-id="${docSnapshot.id}" title="Delete notice">
                                🗑️ Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="notice-content">
                    <p><strong>Notice:</strong> ${data.text}</p>
                </div>
                <div class="notice-footer">
                    <p class="notice-date">
                        Posted on: <em>${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : 'Unknown'}</em>
                    </p>
                    ${data.editedAt ? `
                        <p class="notice-edited">
                            Edited on: <em>${new Date(data.editedAt.seconds * 1000).toLocaleString()}</em>
                        </p>
                    ` : ''}
                </div>
            `;
            noticesContainer.appendChild(noticeDiv);
        });
    } catch (error) {
        console.error("Error loading notices: ", error);
        noticesContainer.innerHTML = '<p style="text-align: center; color: #f44336;">Error loading notices. Please refresh the page.</p>';
    } finally {
        spinner.style.visibility = 'hidden';
    }
}

// Enhanced edit notice functionality
async function editNotice(noticeId) {
    try {
        // First, get the current notice data
        const noticeDoc = await getDoc(doc(db, "notices", noticeId));
        if (!noticeDoc.exists()) {
            showMessage("Notice not found", 'error');
            return;
        }

        const currentData = noticeDoc.data();
        
        // Create a custom modal for editing (better UX than prompt)
        const modal = createEditModal(currentData.text);
        document.body.appendChild(modal);
        
        // Handle modal form submission
        const form = modal.querySelector('#edit-form');
        const textarea = modal.querySelector('#edit-textarea');
        const saveBtn = modal.querySelector('#save-btn');
        const cancelBtn = modal.querySelector('#cancel-btn');
        
        // Focus on textarea and select text
        textarea.focus();
        textarea.select();
        
        // Cancel button handler
        cancelBtn.onclick = () => {
            modal.remove();
        };
        
        // Form submission handler
        form.onsubmit = async (e) => {
            e.preventDefault();
            const newText = textarea.value.trim();
            
            if (!newText) {
                showMessage("Notice text cannot be empty", 'error');
                return;
            }
            
            if (newText === currentData.text) {
                showMessage("No changes made", 'error');
                modal.remove();
                return;
            }
            
            setButtonLoading(saveBtn, true);
            
            try {
                await updateDoc(doc(db, "notices", noticeId), {
                    text: newText,
                    editedAt: serverTimestamp()
                });
                
                showMessage("Notice updated successfully!");
                loadNotices();
                modal.remove();
            } catch (error) {
                console.error("Error updating notice: ", error);
                showMessage("Error updating notice. Please try again.", 'error');
            } finally {
                setButtonLoading(saveBtn, false);
            }
        };
        
    } catch (error) {
        console.error("Error editing notice: ", error);
        showMessage("Error editing notice. Please try again.", 'error');
    }
}

// Create edit modal
function createEditModal(currentText) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 20px;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        ">
            <h3 style="margin-top: 0; color: #333;">Edit Notice</h3>
            <form id="edit-form">
                <textarea 
                    id="edit-textarea" 
                    style="
                        width: 100%;
                        height: 120px;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-family: inherit;
                        font-size: 14px;
                        resize: vertical;
                        box-sizing: border-box;
                    "
                    placeholder="Enter your notice here..."
                    required
                >${currentText}</textarea>
                <div style="
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 15px;
                ">
                    <button 
                        type="button" 
                        id="cancel-btn"
                        style="
                            padding: 8px 16px;
                            border: 1px solid #ddd;
                            background: white;
                            border-radius: 4px;
                            cursor: pointer;
                        "
                    >Cancel</button>
                    <button 
                        type="submit" 
                        id="save-btn"
                        style="
                            padding: 8px 16px;
                            background: #4CAF50;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                        "
                    >Save Changes</button>
                </div>
            </form>
        </div>
    `;
    
    return modal;
}

// Enhanced delete notice functionality
async function deleteNotice(noticeId) {
    // Create custom confirmation modal
    const confirmed = await showConfirmDialog(
        "Delete Notice",
        "Are you sure you want to delete this notice? This action cannot be undone."
    );
    
    if (!confirmed) return;
    
    try {
        await deleteDoc(doc(db, "notices", noticeId));
        showMessage("Notice deleted successfully!");
        loadNotices();
    } catch (error) {
        console.error("Error deleting notice: ", error);
        showMessage("Error deleting notice. Please try again.", 'error');
    }
}

// Custom confirmation dialog
function showConfirmDialog(title, message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 20px;
                border-radius: 8px;
                width: 90%;
                max-width: 400px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            ">
                <h3 style="margin-top: 0; color: #333;">${title}</h3>
                <p style="color: #666; margin-bottom: 20px;">${message}</p>
                <div style="
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                ">
                    <button 
                        id="confirm-cancel"
                        style="
                            padding: 8px 16px;
                            border: 1px solid #ddd;
                            background: white;
                            border-radius: 4px;
                            cursor: pointer;
                        "
                    >Cancel</button>
                    <button 
                        id="confirm-delete"
                        style="
                            padding: 8px 16px;
                            background: #f44336;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                        "
                    >Delete</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#confirm-cancel').onclick = () => {
            modal.remove();
            resolve(false);
        };
        
        modal.querySelector('#confirm-delete').onclick = () => {
            modal.remove();
            resolve(true);
        };
        
        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        };
    });
}

// Event delegation for edit and delete buttons
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-btn")) {
        const noticeId = e.target.getAttribute("data-id");
        await editNotice(noticeId);
    }
    
    if (e.target.classList.contains("delete-btn")) {
        const noticeId = e.target.getAttribute("data-id");
        await deleteNotice(noticeId);
    }
});

// Load notices on page load (will be called after authentication)
// loadNotices(); - Removed from here as it's now called after user authentication