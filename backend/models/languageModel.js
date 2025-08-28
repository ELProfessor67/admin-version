import mongoose from 'mongoose';

const languageScheme = new mongoose.Schema({
    language: { type: String, default: '' },
    flag: { type: String, default: '' }
}, {
    timestamps: true
});

const languageModel = mongoose.model('language', languageScheme);
export default languageModel;