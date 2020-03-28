const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // ## LANGKAHNYA ADA 3 YANG UTAMA

    // 1.) membuat apa yang disebut dengan transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // 2.) mendefinisikan opsi dari mail sender
    const mailOption = {
        from: "Natours Travel <test@natour.com>",
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: ""
    }

    // 3.) kirim email
    await transporter.sendMail(mailOption);
}

module.exports = sendEmail;