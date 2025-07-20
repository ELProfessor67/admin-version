import multer from "multer";
import fs from "fs";
import path from "path";


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const destinaionPath = './uploads/' + req.params.id + '/' + req.folder_name + '/';
        if(!fs.existsSync(destinaionPath)){
            fs.mkdirSync(destinaionPath,{recursive: true})
        }
        cb(null, destinaionPath)
    },
    filename: function(req, file, cb) {
        if(req.folder_name == "event_files"){
            const originalFileName = file.originalname;
            let onlyFileName = (originalFileName.substr(0, originalFileName.lastIndexOf('.'))).trim();
            const extension = originalFileName.substr(originalFileName.lastIndexOf('.') + 1);
            onlyFileName = onlyFileName.replace(/[^a-z0-9]/gi, " ").toLowerCase();
            let fileName = onlyFileName.trim() + "." + extension;
            fileName = fileName.split(" ").join("_");
            fileName = (Math.floor(Math.random() * 90000) + 10000) + fileName;
            cb(null, req.params.id + '-' + fileName)
            return 
        }
        cb(null, Date.now() + '-' + file.originalname)
    }
});


export const fileUploadMiddleware = (folder_name,file_name) => {
    const uploadFile = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } }).single(file_name)
    return (req, res, next) => {
        req.folder_name = folder_name;
        uploadFile(req, res, (err) => {
        if (err) {
            err.message = "File size is too large";
            err.status = 500;
            err.error = true;
            return res.status(500).json(err);
        }




            next();
        });
    }
}

   
