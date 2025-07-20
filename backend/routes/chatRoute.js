import express from "express";
const router = express.Router();
import { deleteChatController, deleteChatHistoryController, getChatController, saveChatController } from "@/controllers/chatController.js";


router.route("/save").post(saveChatController);
router.route("/get").post(getChatController);
router.route("/delete").post(deleteChatController);
router.route("/delete-history").post(deleteChatHistoryController);


export default router;