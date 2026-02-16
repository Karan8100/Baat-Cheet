import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// 1. Transporter Setup (Gmail ke liye)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Tera Gmail (e.g., upadhyaykaran04@gmail.com)
    pass: process.env.GMAIL_APP_PASSWORD, // 16-digit App Password
  },
});


export const sendEmail = async (to, subject, otp) => {
  try {
    console.log(`Sending verification email to: ${to}`);

    const mailOptions = {
      from: `"Baat-Cheet Support" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:40px;">
          <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:10px; text-align:center;">
            <h2 style="color:#333;">Verify Your Email</h2>
            <p style="color:#555; font-size:15px;">
              Thank you for registering. Please use the OTP below to verify your account.
            </p>
            <div style="margin:30px 0;">
              <span style="font-size:28px; letter-spacing:6px; font-weight:bold; color:#4F46E5; background:#EEF2FF; padding:12px 20px; border-radius:8px; display:inline-block;">
                ${otp}
              </span>
            </div>
            <p style="color:#777; font-size:14px;">
              This code will expire in <strong>10 minutes</strong>.
            </p>
            <hr style="margin:25px 0; border:none; border-top:1px solid #eee;" />
            <p style="font-size:12px; color:#999;">
              If you did not create this account, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent:", info.response);
    return info;
    }
    
  

   
   catch (error) {
    console.error(" Nodemailer Error:", error);
    throw new Error("Failed to send email");
  }
};

// 3. Reset Password Email Function (Mailtrap Edition)
export const sendResetEmail = async (to, subject, otp) => {


  try {
    console.log(` Sending reset email to: ${to}`);

    const mailOptions = {
      from: `"Baat-Cheet Support" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: subject || "reset password otp",
      html: `
        <div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:40px;">
          <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:10px; text-align:center;">
            <h2 style="color:#333;">Password Reset Request</h2>
            <p style="color:#555; font-size:15px;">
              We received a request to reset your password. Use the OTP below to proceed.
            </p>
            <div style="margin:30px 0;">
              <span style="font-size:28px; letter-spacing:6px; font-weight:bold; color:#EF4444; background:#FEF2F2; padding:12px 20px; border-radius:8px; display:inline-block;">
                ${otp}
              </span>
            </div>
            <p style="color:#777; font-size:14px;">
              This code will expire in <strong>10 minutes</strong>.
            </p>
            <hr style="margin:25px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size:12px; color:#999;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,

    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Reset email sent:", info.response);
    return info;



    
  } catch (error) {
    console.error(" Reset Email Error:", error);
    throw new Error("Failed to send reset email");
  }
};