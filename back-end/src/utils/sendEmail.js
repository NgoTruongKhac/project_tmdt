import email from "nodemailer";
import { EMAIL_SERVICE, PASS_EMAIL } from "../configs/env.js";

export const sendEmail = async (to, subject, text) => {
  const transporter = email.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_SERVICE,
      pass: PASS_EMAIL,
    },
  });

  const mailOptions = {
    from: EMAIL_SERVICE,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
