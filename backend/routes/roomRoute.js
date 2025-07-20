import express from "express";
const router = express.Router();
import { addRoomController, deleteRoomController, getRoomsByEventIDController, updateRoomController } from "@/controllers/roomController";


router.route('/get-room-by-event-id').post(getRoomsByEventIDController);
router.route('/add').post(addRoomController);
router.route('/update').post(updateRoomController);
router.route('/delete/:id').delete(deleteRoomController);




export default router;