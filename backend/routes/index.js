import express from "express";
const router = express.Router();
import pusherRoute from "@/routes/pusherRoute.js";
import eventRoute from "@/routes/eventRoute.js";
import chatRoute from "@/routes/chatRoute.js";
import languageRoute from "@/routes/languageRoute.js";
import loginRoute from "@/routes/loginRoute.js"
import interpreterRoute from "@/routes/interpreterRoute.js";
import pollRoute from "@/routes/pollRoutes.js"
import roomRoute from "@/routes/roomRoute.js"
import sessionRoute from "@/routes/sessionRoute.js"
import speakerRoute from "@/routes/speakerRoute.js"

router.use("/pusher",pusherRoute);
router.use("/event",eventRoute);
router.use("/chat",chatRoute);
router.use("/language",languageRoute);
router.use("/user",loginRoute);
router.use("/interpreter",interpreterRoute);
router.use("/poll",pollRoute);
router.use("/session",sessionRoute);
router.use("/room",roomRoute);
router.use("/speaker",speakerRoute);

export default router;