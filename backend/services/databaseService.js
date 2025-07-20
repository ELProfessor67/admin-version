import "dotenv/config";
import bcrypt from 'bcryptjs';
import UserModel from '@/models/userModel.js';
import LanguageModel from '@/models/languageModel.js';
import { LANGUAGES } from "@/constants/languagesConstant.js";
import mongoose from "mongoose";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Kobe824";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@rafiky.com";

const createAdmin = async () => {
    const admin = await UserModel.findOne({
        email: ADMIN_EMAIL,
    });
    if (admin) {
        return;
    }
    const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD);
    console.log("Creating Admin: ", {
        email: ADMIN_EMAIL,
        password: hashedPassword,
    })
    await UserModel.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
    });

    console.log("Admin Created: ", ADMIN_EMAIL)
}

const createLanguages = async () => {
    const languages = await LanguageModel.find();
    if (languages.length) {
        return;
    }
    await LanguageModel.insertMany(LANGUAGES);
    console.log("Languages added", LANGUAGES.length)
}

export const connectDB = async () => {
    const DEFAULT_MONGO_URI = "mongodb://dbuser:rpiNHTNv9m5Gtl2h@cluster0-shard-00-00.gulzw.mongodb.net:27017,cluster0-shard-00-01.gulzw.mongodb.net:27017,cluster0-shard-00-02.gulzw.mongodb.net:27017/rafiky?ssl=true&replicaSet=atlas-jced35-shard-0&authSource=admin&retryWrites=true&w=majority"
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI || DEFAULT_MONGO_URI);
        console.log("mongodb successfully connected");
        await createAdmin();
        await createLanguages();
    } catch (error) {
        console.error(`Failed to connect database: ${error.message}`);
        process.exit(1);
    }

}