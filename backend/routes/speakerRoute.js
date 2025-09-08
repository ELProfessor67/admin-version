import express from "express";
const router = express.Router();
import { 
    saveUserController, 
    getSpeakerController, 
    deleteSpeakerController, 
    updateStatusController, 
    updateSpeakerController 
} from "@/controllers/speakerController.js";
import { fileUploadMiddleware } from "@/middlewares/multerMiddleware.js";

// Route to save/create speaker details with file upload
// router.route("/save-speaker/:id").post(fileUploadMiddleware("user_logo", "logo"), saveUserController);
router.route("/save-speaker/:id").post(saveUserController);

// Route to get speaker credentials
router.route("/get-speaker-credentials").post(getSpeakerController);

// Route to delete speaker credentials
router.route("/delete-speaker-credentials").post(deleteSpeakerController);

// Route to update speaker status
router.route("/update-speaker-status/:id").post(updateStatusController);

// Route to update speaker credentials
router.route("/update-speaker-credentials").post(updateSpeakerController);

export default router;
