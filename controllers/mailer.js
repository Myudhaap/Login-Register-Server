import nodemailer from "nodemailer";
import Mailgen from "mailgen";

// https://ethereal.email/create
let nodeConfig = {
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "eula.hamill@ethereal.email",
    pass: "8vqAABsuVQScnf2Add",
  },
};

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Mailgen",
    link: "https://mailgen.js/",
  },
});

/* POST: http://localhost:8080/api/registerMail
  @param: {
    "username": "example123",
    "userEmail": "example@gmail.com",
    "text": "Test",
    "subject": "Backend Mail Request"
  }
*/
export const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;
  console.log(nodeConfig);

  // body of the email
  let email = {
    body: {
      name: username,
      intro:
        text ||
        "Welcome to Mayutama.dev! we are very excited to have you on board.",
      outro:
        "Need help, or have questions? Just reply to this email, we had love to help",
    },
  };

  let emailBody = MailGenerator.generate(email);

  let message = {
    from: process.env.USERNAME_MAILER,
    to: userEmail,
    subject: subject || "Signup Successful",
    html: emailBody,
  };

  // send mail
  transporter
    .sendMail(message)
    .then(() => {
      return res
        .status(200)
        .send({ message: "Yous should receive an email from us" });
    })
    .catch((err) => res.status(500).send({ err }));
};
