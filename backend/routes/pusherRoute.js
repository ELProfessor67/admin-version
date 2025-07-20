import express from "express";
const router = express.Router();
import { pusherSendController } from "@/controllers/pusherController.js";

router.route("/send").post(pusherSendController);

export default router;