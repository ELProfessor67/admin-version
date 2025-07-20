import { addLanguageController, deleteLanguageController, getLanguagesByEventIDController, updateLanguageController } from "@/controllers/languageController";
import express from "express";
const router = express.Router();

router.route('/get-by-event-id').post(getLanguagesByEventIDController);
router.route('/add').post(addLanguageController);
router.route('/udapte').post(updateLanguageController);
router.route('/delete/:id').post(deleteLanguageController);

export default router;