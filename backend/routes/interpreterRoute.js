import express from "express";
const router = express.Router();
import { addAssignmentController, addEventMaterialsController, deleteAssignmentController, deleteEventMaterialController, getAssignmentController, getEventMaterialsByEventIDControlller, getEventMaterialsController, getInterpretersByEventIDController, getLanguageController, updateAssignmentController, uploadEventMaterialController } from "@/controllers/interpreterController.js";
import { fileUploadMiddleware } from "@/middlewares/multerMiddleware.js";


router.route("/get-event-by-id").post(getInterpretersByEventIDController);

router.route("/get-material-by-id").post(getEventMaterialsByEventIDControlller);

router.route("/get-language").get(getLanguageController);
router.route("/add-assigment").post(addAssignmentController);
router.route("/update-assignment").post(updateAssignmentController);
router.route("/get-assigment").get(getAssignmentController);
router.route("/delete-assigment/:id").delete(deleteAssignmentController);
router.route("/add-event-material").post(addEventMaterialsController);
router.route("/get-material").get(getEventMaterialsController);
router.route("/delete-event-materaial/:id").delete(deleteEventMaterialController);
router.route("/upload-event-material/:id").post(fileUploadMiddleware("eventMaterial","file"),uploadEventMaterialController);



export default router;