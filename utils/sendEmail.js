import nodemailer from "nodemailer";

const sendEmail = async (email, subject, message) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,     // smtp.gmail.com
      port: process.env.SMTP_PORT,     // 587
      secure: false,                   // Gmail ke liye false rakho
      auth: {
        user: process.env.SMTP_USERNAME,  // tumhara gmail
        pass: process.env.SMTP_PASSWORD,  // Google App Password (16 digit)
      },
    });

    let info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL, // gmail jisse bhejna hai
      to: email,                         // jis bande ko bhejna hai
      subject: subject,
      html: message,
    });

    console.log("✅ Email sent: %s", info.messageId);
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw new Error("Email not sent");
  }
};

export { sendEmail };
