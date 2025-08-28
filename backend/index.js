import "dotenv/config";
import express from 'express';
import cors from 'cors';
import { connectDB } from "@/services/databaseService";
import errorMiddleware from "@/middlewares/errorMiddleware.js";
import router from "@/routes/index.js";

const app = express();
await connectDB();

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}


app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));
app.use('/', express.static('public'));
app.use('/api/v1',router);
app.use(errorMiddleware);



const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`app is listening on ${PORT}`))
