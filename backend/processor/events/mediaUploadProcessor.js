import { uploadToS3 } from "@/services/AWSService.js";
import path from "path";
import fs from "fs";
import "dotenv/config";
import { savePPTFile } from "@/services/eventService.js";
import { sanitizeFileName } from "./sanitizeFileNameProcessor";
import { getFileExtension } from "./getFileExtensionProcessor";
import { convertPresentation } from "@/services/PresentationService";
import EventFilesModel from "@/models/eventFilesModel";
import { docsLanguages } from "@/constants/languagesConstant";
import { translatePPTFile } from "@/services/translatePdfService";

const ALLOWED_EXTENSIONS = {
    MEDIA: ['mp4', 'mp3'],
    PRESENTATION: ['ppt', 'pptx']
  };

  
export const handleMediaUpload = async (fileName, originalPath, res) => {
    try {
      return new Promise((resolve) => {
        uploadToS3(originalPath + fileName, fileName, originalPath, async (uploadStatus) => {
          if (uploadStatus) {
            // Clean up local file
            const localFilePath = path.join(originalPath, fileName);
            try {
              fs.unlinkSync(localFilePath);
              console.log('Removed uploaded video from local folder');
            } catch (error) {
              console.error('Error removing local file:', error);
            }
  
            const filePath = process.env.S3_BASE_URL + originalPath + fileName;
            resolve({
              status: 'success',
              message: 'Successfully uploaded to S3',
              result: filePath
            });
          } else {
            resolve({
              status: 'failed',
              error: 'Upload Error',
              message: 'Upload failed. Please try again later'
            });
          }
        });
      });
    } catch (error) {
      return {
        status: 'failed',
        error: 'Upload Error',
        message: 'Upload failed. Please try again later'
      };
    }
  }
  
// export const handlePresentationUpload = async (fileName, originalPath, originalFileName, eventId) => {
//     return new Promise((resolve) => {
//       uploadToS3(`./${originalPath}/${fileName}`, fileName, originalPath, async (uploadStatus) => {
//         if (uploadStatus) {
//           const filePath = process.env.S3_BASE_URL + originalPath + fileName;
          
//           const eventFileParams = {
//             title: originalFileName,
//             url: filePath,
//             event_id: eventId,
//             originalpath: originalPath + fileName,
//             converted_status: 0,
//             type: 'ppt'
//           };
  
//           try {
//             const savedPPT = await savePPTFile(eventFileParams);
//             const room = savedPPT.result?._id || "";
//             const REDIRECT_URL = process.env.REDIRECT_URL;
//             console.log(`CONVERTING PRESENTATION ${fileName}`);
//             const conversionResponse = await convertPresentation(`./${originalPath}/${fileName}`, fileName);
//             console.log('conversionResponse', conversionResponse);
//             if(conversionResponse.id){
//               const url = `/PptDirectory/${conversionResponse.id}/HTML5Point_output/HTML5Point_output.html`;
//               console.log('url', url);
//               const eventData = await EventFilesModel.findById(room).exec();
//               eventData.presentation_url = url;
//               eventData.converted_status = 1;
//               eventData.status = 'success';
//               await eventData.save();

//               resolve({
//                 status: 'success',
//                 error: 'false',
//                 message: 'Conversion is in progress',
//                 result: eventData
//               });

//             }else{
//               // Trigger conversion
//               const requestUri = `${process.env.CONVERSION_API_URL}?file=${encodeURIComponent(filePath)}&redirect=${encodeURIComponent(REDIRECT_URL)}&room=${room}&s3update=true&s3bucket=${process.env.S3_BUCKET_NAME}`;
//               console.log('requestUri', requestUri);
//               // Fire and forget the conversion request
//               const response = await fetch(requestUri);
//               if(!response.ok){
//                   console.error('Conversion request error:', error);
//               }
    
//               resolve({
//                 status: 'success',
//                 error: 'false',
//                 message: 'Conversion is in progress',
//                 result: savedPPT
//               });
//             }
//           } catch (error) {
//             console.error('Error saving PPT file:', error);
//             resolve({
//               status: 'failed',
//               error: 'Database Error',
//               message: 'Failed to save file information'
//             });
//           }
//         } else {
//           resolve({
//             status: 'failed',
//             error: 'Upload Error',
//             message: 'Upload failed. Please try again later'
//           });
//         }
//       });
//     });
//   }



export const handlePresentationUpload = async (fileName, originalPath, originalFileName, eventId) => {
      return new Promise(async (resolve) => {
        const files = []
        const translateAndUpload = async (lang) => {

          console.log("Translating to ", lang.language);
          const translateResponse = await translatePPTFile(originalPath + fileName, lang.languageCode);
          if(translateResponse.status === 'success'){
            console.log("Uploading to S3", translateResponse.outputPath);
              
                //convert to html
                console.log("Converting to HTML", translateResponse.outputPath);
                const convertResponse = await convertPresentation(translateResponse.outputPath, `${Date.now()}_${lang.languageCode}.pptx`);
                console.log("Convert Response", convertResponse);
                const url = `/PptDirectory/${convertResponse.id}/HTML5Point_output/HTML5Point_output.html`;
                  files.push({
                    language: lang.language,
                    url: url,
                    languageCode: lang.languageCode,
                  });
                  //delete the translated file
                  fs.unlinkSync(translateResponse.outputPath);
                  console.log("Deleted the translated file", translateResponse.outputPath);
                  return true;
              
          }else{
            console.log("Error translating", translateResponse.error);
          }
        }

        await Promise.all(docsLanguages.map(async (lang) => await translateAndUpload(lang)));
        console.log('files', files);


        const filePath = process.env.S3_BASE_URL + originalPath + fileName;
            
            const eventFileParams = {
              title: originalFileName,
              url: filePath,
              event_id: eventId,
              originalpath: originalPath + fileName,
              converted_status: 0,
              type: 'ppt'
            };
    
            try {
              const savedPPT = await savePPTFile(eventFileParams);
              const room = savedPPT.result?._id || "";
              const REDIRECT_URL = process.env.REDIRECT_URL;
              console.log(`CONVERTING PRESENTATION ${fileName}`);
              const conversionResponse = await convertPresentation(`./${originalPath}/${fileName}`, fileName);
              console.log('conversionResponse', conversionResponse);

             
              if(conversionResponse.id){
                const url = `/PptDirectory/${conversionResponse.id}/HTML5Point_output/HTML5Point_output.html`;
                files.push({
                  language: 'original',
                  url: url,
                  languageCode: 'original',
                });
                const eventData = await EventFilesModel.findById(room).exec();
                eventData.languages   = files;
                eventData.converted_status = 1;
                eventData.status = 'success';
                await eventData.save();
  
                resolve({
                  status: 'success',
                  error: 'false',
                  message: 'Conversion is in progress',
                  result: eventData
                });
              }else{
                // Trigger conversion
                const requestUri = `${process.env.CONVERSION_API_URL}?file=${encodeURIComponent(filePath)}&redirect=${encodeURIComponent(REDIRECT_URL)}&room=${room}&s3update=true&s3bucket=${process.env.S3_BUCKET_NAME}`;
                console.log('requestUri', requestUri);
                // Fire and forget the conversion request
                const response = await fetch(requestUri);
                if(!response.ok){
                    console.error('Conversion request error:', error);
                }
      
                resolve({
                  status: 'success',
                  error: 'false',
                  message: 'Conversion is in progress',
                  result: savedPPT
                });
              }
            } catch (error) {
              console.error('Error saving PPT file:', error);
              resolve({
                status: 'failed',
                error: 'Database Error',
                message: 'Failed to save file information'
              });
            }
      });
    }
  
export const processFileUpload = async (req, eventId) => {
    if (!req.file?.fieldname) {
      return {
        status: 'failed',
        error: 'Validation Error',
        message: 'File is missing'
      };
    }
  
    const { originalname: originalFileName, filename: fileName } = req.file;
    const extension = getFileExtension(originalFileName);
    const sanitizedName = sanitizeFileName(originalFileName);
    const originalPath = `uploads/${eventId}/event_files/`;
  
    // Validate file extension
    const isMediaFile = ALLOWED_EXTENSIONS.MEDIA.includes(extension);
    const isPresentationFile = ALLOWED_EXTENSIONS.PRESENTATION.includes(extension);
  
    if (!isMediaFile && !isPresentationFile) {
      return {
        status: 'failed',
        error: 'Validation Error',
        message: 'Please upload mp4, mp3, ppt or pptx file'
      };
    }
  
    // Process based on file type
    if (isMediaFile) {
      return await handleMediaUpload(fileName, originalPath);
    } else {
      return await handlePresentationUpload(fileName, originalPath, originalFileName, eventId);
    }
}
  