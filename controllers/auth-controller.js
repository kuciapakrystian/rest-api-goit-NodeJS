import { HttpError, sendEmail } from "../helpers/index.js";
import { ctrlWrapper } from "../decorators/index.js";
import User from "../models/Users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import gravatar from "gravatar";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";
import { v4 as uuid4 } from "uuid";

const avatarPath = path.resolve("public", "avatars");

const { JWT_SECRET, BASE_URL } = process.env;

const signUp = async (req, res) => {
  const { password, email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(
      409,
      "Email In Use: The provided email address is already associated with an existing account. If you already have an account, please log in."
    );
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "mm" });
  const verificationToken = uuid4();
  console.log("verification code", verificationToken);
  const newUser = await User.create({
    email,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Action Required: Verify Your Email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click to verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    message:
      "Congratulations! Your registration was successful. You can now sign in with your new account.",
    user: {
      email: newUser.email,
      subscription: "starter",
      avatarURL: newUser.avatarURL,
      verificationToken,
    },
  });
};

const signIn = async (req, res) => {
  const { password, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(
      401,
      "Authentication Failed: Incorrect login or password. Please double-check your credentials and try again."
    );
  }

  if (!user.verify) {
    throw HttpError(
      401,
      "Email Not Verified: Please verify your email to access this resource. Check your inbox for instructions on how to complete the verification process."
    );
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(
      401,
      "Authentication Failed: Incorrect login or password. Please double-check your credentials and try again"
    );
  }

  const { _id: id } = user;
  const payload = {
    id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

  await User.findByIdAndUpdate(id, { token });

  res.json({
    token,
    user: {
      email: user.email,
      subscription: "starter",
    },
  });
};

const logOut = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({
    message: "Logout Successful: You have been successfully logged out.",
  });
};

const updateSubscription = async (req, res) => {
  const { subscription } = req.body;
  const { _id: owner } = req.user;
  const updatedUser = await User.findOneAndUpdate(
    owner,
    { subscription },
    { new: true }
  );

  if (!updatedUser) {
    throw HttpError(
      401,
      "Authentication Failed: User not found or incorrect login. Please verify your credentials and try again."
    );
  }

  res.json(updatedUser);
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
};

const updateAvatar = async (req, res) => {
  const { user } = req;
  const { path: oldPath, filename } = req.file;
  const newPath = path.join(avatarPath, filename);

  await Jimp.read(oldPath).then((image) =>
    image.resize(256, 256).writeAsync(newPath)
  );

  await fs.unlink(oldPath);

  const avatar = path.join("avatars", filename);

  await User.findByIdAndUpdate(user._id, { avatarURL: avatar });

  res.json({
    avatarURL: avatar,
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(
      400,
      "Verification Issue: The provided email was not found or has already been verified."
    );
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });
  res.json({
    message:
      "Email Verification Successful: Your email has been successfully verified. You can now access and enjoy our services. Thank you for confirming your email!",
  });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(
      404,
      "User Not Found: The provided email address could not be found in our records. Please make sure you've entered the correct email or consider registering for an account."
    );
  }
  if (user.verify) {
    throw HttpError(
      400,
      "Email Already Verified: This email address has already been verified."
    );
  }

  const verifyEmail = {
    to: email,
    subject: "Action Required: Verify Your Email",
    html: `<a target="_blank" href="http://${BASE_URL}/api/auth/${verificationToken}">Click to verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message:
      "Verification Email Sent: An email with instructions to verify your email has been successfully sent. Please check your inbox and follow the provided instructions. If you don't receive the email, please check your spam folder or contact our support team for assistance.",
  });
};

export default {
  signUp: ctrlWrapper(signUp),
  signIn: ctrlWrapper(signIn),
  getCurrent: ctrlWrapper(getCurrent),
  logOut: ctrlWrapper(logOut),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};