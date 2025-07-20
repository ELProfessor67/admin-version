import express from "express";
const router = express.Router();
import { checkEmailIDController, checkEventCodeController, checkEventUserDetailsExistsController, deleteEventController, deleteEventFileController, deleteEventUserController, downloadUserStreamReportController, eventDetailsController, eventFileListController, geSessionController, getAllEventsController, getEventAgendaController, getEventByIDController, getRoomDetailsController, getRoomEventsController, getRoomPropertyController, getSessionsController, getUserStreamReportController, LandingPageBgController, saveEventController, saveEventEndTimeController, saveEventFileController, saveEventUserController, saveRoomPropertyController, startArchiveController, stopArchiveController, updateConversionStatusController, updateEventController, updateEventUserDetailsController, updateSelectedLanguageController, uploadConferencePageBgController, uploadCoverImageController, uploadEventUserController, uploadFileController, uploadLobbyResourceController, uploadLoginPageBgController, uploadLogoController } from "@/controllers/eventController.js";
import { fileUploadMiddleware } from "@/middlewares/multerMiddleware";


router.route("/get-session-details").post(geSessionController);
router.route("/save-event-end-time").post(saveEventEndTimeController);
router.route("/get-room-property").post(getRoomPropertyController );
router.route("/save-room-property").post(saveRoomPropertyController);
router.route("/save-event").post(saveEventController);
router.route("/update-event").post(updateEventController);
router.route("/get-all-events").post(getAllEventsController);
router.route("/get-room-events").post(getRoomEventsController);
router.route("/get-event-agenda").post(getEventAgendaController);
router.route("/check-event-code/:id").get(checkEventCodeController);
router.route("/upload-cover-image/:id").post(fileUploadMiddleware("coverimage","file"),uploadCoverImageController);
router.route("/upload-logo/:id").post(fileUploadMiddleware("logoimage","file"),uploadLogoController);
router.route("/upload-lobby-resource/:id").post(fileUploadMiddleware("lobbyresource","file"),uploadLobbyResourceController);
router.route("/upload-login-page-bg/:id").post(fileUploadMiddleware("loginpagebg","file"),uploadLoginPageBgController);
router.route("/upload-landing-page-bg/:id").post(fileUploadMiddleware("landingpagebg","file"),LandingPageBgController);
router.route("/upload-conference-page-bg/:id").post(fileUploadMiddleware("landingpagebg","file"),uploadConferencePageBgController);
router.route("/get-event-by-id/:id").post(getEventByIDController);
router.route("/check-email-id").post(checkEmailIDController);
router.route("/check-event-user-details").post(checkEventUserDetailsExistsController);
router.route("/get-room-details").post(getRoomDetailsController);
router.route("/get-session").post(getSessionsController);
router.route("/download-user-stream-report/:eventId").post(downloadUserStreamReportController);
router.route("/get-user-stream-report").post(getUserStreamReportController);
router.route("/delete-event/:id").delete(deleteEventController);
router.route("/delete-user-event/:id").delete(deleteEventUserController);
router.route("/start-archived/:id").post(startArchiveController);
router.route("/stop-archived/:id").post(stopArchiveController);
router.route("/upload-file/:id").post(uploadFileController);
router.route("/save-file-event").post(saveEventFileController);
router.route("/file-event-list").post(eventFileListController);
router.route("/delete-event-file").post(deleteEventFileController);
router.route("/update-selected-language").post(updateSelectedLanguageController);
router.route("/update-conversation-status").post(updateConversionStatusController);
router.route("/event-details").post(eventDetailsController);
router.route("/save-event-user").post(saveEventUserController);
router.route("/upload-event-user").post(uploadEventUserController);
router.route("/update-user-event-detail").post(updateEventUserDetailsController);


export default router;