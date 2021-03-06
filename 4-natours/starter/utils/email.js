const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url){
        this.to = user.email
        this.firstName = user.firstName
        this.url = url
        this.from = `Jonas Schmedtmann <${process.env.ELASTICMAIL_USERNAME}>`
    }

    newTransporter() {
        if(process.env.NODE_ENV === "production"){
            //nanti akan menggunakan elasticmail
            return nodemailer.createTransport({
                host: process.env.ELASTICMAIL_HOST,
                port: process.env.ELASTICMAIL_PORT,
                auth: {
                    user: process.env.ELASTICMAIL_USERNAME,
                    pass: process.env.ELASTICMAIL_PASSWORD
                }
            })
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })
    }

    async send(template, subject){
        //mengambil renderan hasil pug ke html sebagai strings
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        //membuat mail option
        const mailOption = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html),
        }

        //membuat transporter dan mengirimnya
        await this.newTransporter().sendMail(mailOption);

    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to Natours Family!')
    }

    async sendResetPassword(){
        await this.send('resetPassword', 'Password Reset (valid only 1 hour)')
    }
}