import express from "express";
const router = express.Router();
import { addAgendaController, deleteAgendaController, getAgendaController, getSessionsByEventIDController, updateAgendaController } from "@/controllers/sessionController.js";


router.route("/get-by-event-id").post(getSessionsByEventIDController);
router.route("/add-agenda").post(addAgendaController);
router.route("/update-agenda").post(updateAgendaController);
router.route("/get-agenda").get(getAgendaController);
router.route("/delete-agenda").delete(deleteAgendaController);


export default router;