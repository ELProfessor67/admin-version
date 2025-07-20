import express from "express";
const router = express.Router();
import { checkEmailExistController, decodeTokenController, encodeTokenController, loginWithPasswordController } from "@/controllers/loginController.js";


router.route("/check-emial-exist").post(checkEmailExistController);
router.route("/login-with-password").post(loginWithPasswordController);
router.route("/decode-token").get(decodeTokenController);
router.route("/encode-token").post(encodeTokenController);


export default router;