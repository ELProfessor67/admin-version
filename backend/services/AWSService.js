import "dotenv/config";
import AWS from "aws-sdk";
import fs from "fs";

export const s3AWSBucket = new AWS.S3({
    signatureVersion: 'v4',
    apiVersion: '2006-03-01',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});



export const uploadToS3 = (files, fileName, original_path, cb) => {
    // return false;
    console.log('files', files);
    return new Promise((resolve, reject) => {
        const fileContent = fs.readFileSync(files);
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: original_path + fileName,
            Body: fileContent
        };
        let extension = fileName.substr(fileName.lastIndexOf('.') + 1);
        if (extension === 'html') {
            params.ContentType = 'text/html'
        } else if (extension === 'css') {
            params.ContentType = 'text/css'
        } else if (extension === 'js') {
            params.ContentType = 'text/javascript'
        } else if (extension === 'png') {
            params.ContentType = 'image/png'
        }
        try {
            s3AWSBucket.putObject(params, function(err, data) {
                if (err) {
                    cb(false)
                } else {
                    cb(true, fileName)
                }
            });

        } catch (error) {
            console.log('eee', error);

        }

    })
}
