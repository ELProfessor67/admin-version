import { addLanguageController, deleteLanguageController, getLanguagesByEventIDController, updateLanguageController } from "@/controllers/languageController";
import express from "express";
const router = express.Router();

router.route('/get-by-event-id').post(getLanguagesByEventIDController);
router.route('/add').post(addLanguageController);
router.route('/update').post(updateLanguageController);
router.route('/delete/:id').delete(deleteLanguageController);

export default router;