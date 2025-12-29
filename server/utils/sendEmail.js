import transporter from "../config/nodemailer.js";

const sendEmail = async ({ to, subject, text }) => {
  try {
    const mailOptions = {
      from: `"Movie App" <${process.env.SENDER_EMAIL}>`,
      to: to,       
      subject: subject, 
      text: text,       
    //   html: html,      
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: " + info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;