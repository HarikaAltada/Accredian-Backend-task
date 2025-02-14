const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// Referral API Endpoint
app.post("/api/referrals", async (req, res) => {
    try {
      const { name, email, referredName, referredEmail } = req.body;
  
      if (!name || !email || !referredName || !referredEmail) {
        return res.status(400).json({ error: "All fields are required." });
      }
  
      // Save referral to MySQL
      const newReferral = await prisma.referral.create({
        data: { name, email, referredName, referredEmail },
      });
  
      // Attempt to send the email
      try {
        await sendReferralEmail(email, referredEmail);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        return res.status(201).json({
          message: "Referral saved, but email failed to send.",
          referral: newReferral,
        });
      }
  
      res.status(201).json({
        message: "Referral submitted successfully!",
        referral: newReferral,
      });
  
    } catch (error) {
      console.error("Database Error:", error);
      res.status(500).json({ error: "Something went wrong.", details: error.message });
    }
  });
  
  
  
// Function to Send Email
const sendReferralEmail = async (senderEmail, referredEmail) => {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      await transporter.sendMail({
        from: `"Referral System" <${process.env.EMAIL_USER}>`,
        to: referredEmail,
        subject: "You’ve Been Referred!",
        text: `Hello! ${senderEmail} referred you. Sign up today.`,
      });
  
      
    } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error("Email sending failed.");
    }
  };
  
  app.get("/", (req, res) => {
    res.send("Welcome to the API");
  });  

// Start Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
