import 'dotenv';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
const {
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  NODE_ENV,
  SENDINBLUE_SMTP_Server,
  SENDINBLUE_PASSWORD,
  SENDINBLUE_Login,
} = process.env;

//Email class
export const Email = class {
  to: string;
  name: string;
  url?: string;
  from: string;

  constructor(user: { email: string; name: string }, url?: string) {
    this.to = user.email;
    this.name = user.name;
    this.url = url;
    this.from = 'Nest boilerplate <noreply@robavelii.com>';
  }

  readonly newTransport =
    (): nodemailer.Transporter<SMTPTransport.SentMessageInfo> => {
      if (NODE_ENV === 'production') {
        return nodemailer.createTransport({
          host: SENDINBLUE_SMTP_Server,
          port: 465,
          auth: {
            user: SENDINBLUE_Login,
            pass: SENDINBLUE_PASSWORD,
          },
        });
      } else {
        return nodemailer.createTransport({
          host: 'smtp.mailtrap.io',
          port: 2525,
          auth: {
            user: EMAIL_USERNAME,
            pass: EMAIL_PASSWORD,
          },
        });
      }
    };

  readonly send = async (template: any, subject: any) => {
    // render the html for the email

    // define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: template,
    };

    // create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  };

  readonly sendEmailVerificationCode = async (emailToken: string) => {
    const html = `
           <h3>Welcome to My Nest Boilerplate. A NestJS Starter API kit</h3>
           <h1> ${emailToken} </h1> <span> is your Email Verification Code</span>
           <h4>Verification code is Valid for 10 minutes</h4>
    `;

    return await this.send(html, 'Email Verification Code');
  };

  readonly passwordResetToken = async (resetToken: string) => {
    const html = `
           <h3>Reset Your Password</h3>
           <h1> ${resetToken} </h1> <span> is your Password Reset Code</span>
           <h4>Reset code is Valid for 10 minutes</h4>
    `;

    return await this.send(html, 'Password Reset Code');
  };
};
