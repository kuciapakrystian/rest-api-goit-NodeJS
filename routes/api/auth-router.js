import express from "express";
import { validateBody } from "../../decorators/index.js";
import authController from "../../controllers/auth-controller.js";
import { isEmptyBody, authenticate, upload } from "../../middleware/index.js";
import {
  userAuthSchema,
  updateSubscriptionSchema,
} from "../../schemas/auth-schema.js";

const authRouter = express.Router();

authRouter.post(
  "/signup",
  isEmptyBody,
  validateBody(userAuthSchema),
  authController.signUp
);

authRouter.post(
  "/signin",
  isEmptyBody,
  validateBody(userAuthSchema),
  authController.signIn
);

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.post("/logout", authenticate, authController.logOut);

authRouter.patch(
  "/",
  isEmptyBody,
  authenticate,
  validateBody(updateSubscriptionSchema),
  authController.updateSubscription
);

authRouter.patch(
  "/avatars",
  upload.single("avatar"),
  // isEmptyBody,
  authenticate,
  authController.updateAvatar
);

export default authRouter;