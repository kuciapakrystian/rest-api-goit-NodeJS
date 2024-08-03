import nodemailer from "nodemailer";
import "dotenv/config";

const { MAIL_API_KEY, MAIL_FROM } = process.env;

const nodemailerConfig = {
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: {
    user: MAIL_API_KEY,
    pass: MAIL_FROM,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const email = {
  from: MAIL_API_KEY,
  to: "email address for who",
  subject: "topic of the letter",
  html: "<stron>Hi!</stron>",
};

transport
  .sendMail(email)
  .then(() => {
    console.log("Email sent!");
  })
  .catch((err) => {
    console.log(err.message);
  });