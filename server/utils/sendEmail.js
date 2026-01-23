import transporter from "../config/nodemailer.js";

const sendEmail = async ({ to, subject, text }) => {
  try {
    const mailOptions = {
      from: `"Movie App" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
