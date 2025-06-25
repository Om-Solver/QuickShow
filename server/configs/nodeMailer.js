import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify transporter connection at startup
transporter.verify(function(error, success) {
    if (error) {
        console.error("SMTP transporter verification failed:", error);
    } else {
        console.log("SMTP transporter is ready to send emails.");
        console.log("SMTP_USER:", process.env.SMTP_USER);
        console.log("SENDER_EMAIL:", process.env.SENDER_EMAIL);
    }
});

const sendEmail = async ({ to, subject, body }) => {
    const response = await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to,
        subject,
        html: body,
    })
    return response
}

export default sendEmail;