import mongoose from 'mongoose';

const eventScheme = new mongoose.Schema({
    name: { type: String, default: '' },
    address: { type: String, default: '' },
    testEvent: { type: Boolean, default: false },
    repeatWeekly: { type: Boolean, default: false },
    date: { type: Date, default: '' },
    start_time: { type: Date, default: '' },
    end_time: { type: Date, default: '' },
    start_date_time: { type: Date, default: '' },
    description: { type: String, default: '' },
    cover_image: { type: Array, default: '' },
    logo_image: { type: String, default: '' },
    lobby_resource: { type: String, default: '' },
    login_page_bg: { type: String, default: '' },
    landing_page_bg: { type: String, default: '' },
    conference_page_bg: { type: String, default: '' },
    event_code: { type: String, default: '' },
    finish: { type: Boolean, default: false },
    useDefault: { type: Boolean, default: false }, 
    streamOut: { type: Boolean, default: false },
    speakerUserList: { type: Boolean, default: false },
    enableDownloadPpt: { type: Boolean, default: false },
    enableHighResolution: { type: Boolean, default: false },
    enableSecondaryModerator: { type: Boolean, default: false },
    enableMasterSpeaker:{ type: Boolean, default: false },
    translationAI:{ type: Boolean, default: false },
    disableChat: { type: Boolean, default: false },
    disablePublicCL: { type: Boolean, default: false },
    disablePublicCS: { type: Boolean, default: false },
    disablePrivateCL: { type: Boolean, default: false },
    disablePrivateCS: { type: Boolean, default: false },
    enablePopupNot: { type: Boolean, default: false },
    signLanguageMode: { type: Boolean, default: false },
    password: { type: String, default: '' },
    recording: { type: Boolean, default: false },
    archives: { type: Array, default: [] },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    timezone: { type: String, default: '' }
}, {
    timestamps: true
});

const eventModel = mongoose.model('event', eventScheme);
export default eventModel;
