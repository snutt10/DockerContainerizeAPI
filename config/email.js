// config/email.js
const nodemailer = require("nodemailer");

let transporter;

const createTransporter = async () => {
    // Create Ethereal test account
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    console.log("Ethereal Email Account Created:");
    console.log("User:", testAccount.user);
    console.log("Pass:", testAccount.pass);

    return transporter;
};

module.exports = createTransporter;
