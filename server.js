const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = require('./easycab-71fcf-firebase-adminsdk-ofkh5-ee6b11b1bd.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(express.json()); // ✅ Correct usage
app.use(express.urlencoded({ extended: true }));




const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Endpoint to send an email when driver details are assigned
app.post('/send-driver-email', async (req, res) => {
    const { bookingId, driverName, driverPhone, cabName, taxiNumber, estimatedPickTime, driverMessage } = req.body;

    if (!driverMessage) {
        console.warn("⚠️ Warning: driverMessage is not provided in the request body. Defaulting to 'No message provided'.");
    }   

    try {
        console.log("📌 Received bookingId:", bookingId);

        // Fetch booking details
        const bookingRef = admin.firestore().collection("bookings").doc(bookingId);
        const bookingDoc = await bookingRef.get();

        if (!bookingDoc.exists) {
            console.log("❌ Booking not found!");
            return res.status(404).json({ message: "Booking not found" });
        }

        const bookingData = bookingDoc.data();
        console.log("📜 Booking Data Retrieved:", bookingData);

        const userId = bookingData.userId;
        if (!userId) {
            console.log("❌ Error: User ID is missing in booking document.");
            return res.status(400).json({ message: "User ID not found" });
        }

        // Fetch user email
        const userRef = admin.firestore().collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.log("❌ User not found in Firestore!");
            return res.status(404).json({ message: "User not found" });
        }

        const userEmail = userDoc.data().email;
        console.log("📧 User Email:", userEmail);

        if (!userEmail) {
            console.log("❌ Error: User email is missing.");
            return res.status(400).json({ message: "User email not found" });
        }

        // Use the same field names as in UI
        const bookingDetails = {
            bookingId: bookingId,
            car: bookingData.car || "Not Available",
            noOfStudents: bookingData.noOfStudents || "Not Available",
            pickupLocation: bookingData.from || "Not Available",
            dropoffLocation: bookingData.to || "Not Available",
            date: bookingData.date || "Not Available",
            time: bookingData.time || "Not Available",
            paymentMode: bookingData.paymentMode || "Not Available",
            message: bookingData.message || "No Message",
            fare: bookingData.amount ? `₹${bookingData.amount}` : "Not Available"
        };

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `🚖 Your Booking & Driver Details (Booking ID: ${bookingId})`,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Booking Confirmation</title>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; background: #ffffff; margin: 20px auto; padding: 20px; border-radius: 8px; 
                        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); text-align: center; }
                    .header { font-size: 20px; font-weight: bold; color: #007bff; }
                    .section { text-align: left; padding: 15px; background: #f8f9fa; border-radius: 6px; margin-top: 15px; }
                    .footer { margin-top: 20px; font-size: 14px; color: #666; }
                    .button { display: inline-block; padding: 10px 15px; background-color: #007bff; color: white; 
                        text-decoration: none; border-radius: 5px; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">🚖 Booking & Driver Details</div>
                    <p>Dear Customer, your ride details are confirmed.</p>
                    
                    <div class="section">
                        <h3>📌 Booking Details</h3>
                        <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
                        <p><strong>Car:</strong> ${bookingDetails.car}</p>
                        <p><strong>No of Students:</strong> ${bookingDetails.noOfStudents}</p>
                        <p><strong>Pickup Location:</strong> ${bookingDetails.pickupLocation}</p>
                        <p><strong>Drop-off Location:</strong> ${bookingDetails.dropoffLocation}</p>
                        <p><strong>Date:</strong> ${bookingDetails.date}</p>
                        <p><strong>Time:</strong> ${bookingDetails.time}</p>
                        <p><strong>Payment Mode:</strong> ${bookingDetails.paymentMode}</p>
                        <p><strong>Message:</strong> ${bookingDetails.message}</p>
                        <p><strong>Fare:</strong> ${bookingDetails.fare}</p>
                    </div>

                    <div class="section">
                        <h3>👨‍✈️ Driver Details</h3>
                        <p><strong>Driver Name:</strong> ${driverName}</p>
                        <p><strong>Phone Number:</strong> ${driverPhone}</p>
                        <p><strong>Cab Name:</strong> ${cabName}</p>
                        <p><strong>Taxi Number:</strong> ${taxiNumber}</p>
                        <p><strong>Estimated Pickup Time:</strong> ${estimatedPickTime}</p>
                        <p><strong>Message:</strong> ${driverMessage || "No message provided"}</p>
                    </div>

                    <a href="https://easycab.site/" class="button">View Booking</a>

                    <p class="footer">For any queries, contact us at <strong>support@easycab.com</strong>.</p>
                    <p class="footer">© 2025 VITGO. All rights reserved.</p>
                </div>
            </body>
            </html>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Driver details email sent successfully!" });

    } catch (error) {
        console.error("🔥 Error sending driver email:", error);
        res.status(500).json({ message: "Failed to send email" });
    }
});




app.post('/send-welcome-email', async (req, res) => {
    const { email, name } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🚀 Welcome to VITGO! Get Started by Updating Your Profile',
        html: `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Welcome to VITGO</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    background: #ffffff;
                    margin: 20px auto;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .logo {
                    width: 120px;
                    margin-bottom: 10px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 20px;
                    background-color: #007bff;
                    color: #ffffff;
                    text-decoration: none;
                    font-weight: bold;
                    border-radius: 5px;
                    margin-top: 10px;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 14px;
                    color: #666;
                }
                .social-icons img {
                    width: 30px;
                    margin: 10px;
                }
                .steps {
                    text-align: left;
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 6px;
                    margin-top: 15px;
                    display: inline-block;
                }
                .support {
                    margin-top: 20px;
                    font-size: 14px;
                    color: #444;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://easycab.site/assets/logo%20(1).png" alt="VITGO Logo" class="logo">
                <h2>👋 Welcome, ${name}!</h2>
                <p>We're excited to have you on <strong>VITGO</strong>! 🎉 To get the best experience, please take a moment to update your profile.</p>
                
                <div class="steps">
                    <h3>🛠️ How to Update Your Profile:</h3>
                    <p>✅ Step 1: <strong>Login</strong> to your account.</p>
                    <p>✅ Step 2: Navigate to the <strong>Profile</strong> tab.</p>
                    <p>✅ Step 3: Enter your details and click <strong>Update</strong>. 🎯</p>
                </div>
                
                <a href="https://easycab.site/" class="button">Go to Login 🚀</a>
                <br><br>
    
                <div class="support">
                    <p>💡 Need Help? If you face any issues, feel free to reach out to us at <strong>vitgo.vitvellore@gmail.com</strong>. 📩</p>
                    <p>📸 If possible, please attach a screenshot of the issue to help us resolve it faster.</p>
                </div>
    
                <p>Best regards,<br><strong>The VITGO Team</strong> 🚀</p>
                
                <div class="social-icons">
                    <a href="https://www.instagram.com/vitgo" target="_blank">
                        <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram">
                    </a>
                    <a href="https://www.linkedin.com/company/vitgo" target="_blank">
                        <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn">
                    </a>
                </div>
                
                <p class="footer">© 2025 VITGO. All rights reserved.</p>
            </div>
        </body>
        </html>`
    };



    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send({ message: 'Welcome email sent successfully!' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
