import catchAsyncError from "@/middlewares/catchAsyncError.js";
import { pusher } from "@/services/pusherService.js";
import ErrorHandler from "@/utils/ErrorHandler";

export const pusherSendController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const { channel } = body;
    if (!channel) {
        return next(new ErrorHandler("Channel is required", 400));
    }
    try {
        pusher.trigger(channel, "client-message", body);
        return res.status(200).json({
            success: true,
            message: "Send Successfully"
        });
    } catch (error) {
        return next(new ErrorHandler("Failed to send message via pusher", 500));
    }
});
