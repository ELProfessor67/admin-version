import express from "express";
const router = express.Router();
import {addQuestionController, createPollController, deletePollController, deletePollQuestionController, getListQuestionController, getPollListController, getPollListForAllEventController, getPollReportController, getReportController, saveAnswerController, updatePollController, updatePollQuestionController} from "@/controllers/pollController.js";


// poll response route 
router.route("/add-question").post(saveAnswerController);


// poll question route 
router.route("/add-question").post(addQuestionController);
router.route("/get-question").post(getListQuestionController);
router.route("/get-report").post(getReportController);
router.route("/delete-question").delete(deletePollQuestionController);
router.route("/update-question").post(updatePollQuestionController);


// poll routes 
router.route("/create").post(createPollController);
router.route("/get-poll-report").post(getPollReportController);
router.route("/get-poll").post(getPollListController);
router.route("/get-poll-for-event").post(getPollListForAllEventController);
router.route("/delete").delete(deletePollController);
router.route("/update").post(updatePollController);


export default router;