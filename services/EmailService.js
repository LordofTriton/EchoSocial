
import * as path from 'path';

const fs = require('fs');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: true,
    logger: true,
    debug: true,
    auth: {
        user: "dev.echosocial@gmail.com",
        pass: "nvdx mvpn uwdm xybx"
    },
});

function SendEmail(to, subject, template, content) {
    const templatePath = path.resolve(
        'util',
        `mail-templates/${template}.html`,
    );

    let html = fs.readFileSync(templatePath, 'utf8');

    if (html.includes("{{FirstName}}") && content.firstName) html = html.replaceAll("{{FirstName}}", content.firstName)
    if (html.includes("{{ProfileURL}}") && content.profileUrl) html = html.replaceAll("{{ProfileURL}}", content.profileUrl)
    if (html.includes("{{ResetPasswordURL}}") && content.resetPasswordUrl) html = html.replaceAll("{{ResetPasswordURL}}", content.resetPasswordUrl)

    const mailOptions = {
        from: "dev.echosocial@gmail.com",
        to,
        subject,
        html
    };

    return transporter.sendMail(mailOptions);
}

export default SendEmail;