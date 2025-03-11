const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // ✅ Use 'gmail' or another email provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ Function to send an email
const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html 
        };

        await transporter.sendMail(mailOptions);
        console.log("📧 Email sent successfully to", to);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
};

module.exports = sendEmail;
