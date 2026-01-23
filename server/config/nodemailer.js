import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,      // your gmail address
    pass: process.env.GMAIL_APP_PASS,  // app password (NOT your gmail password)
  },
});

export default transporter;
