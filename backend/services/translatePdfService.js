import * as deepl from "deepl-node";
import "dotenv/config";
import path from "path";


export const translatePPTFile = async (inputPath, targetLanguage) => {
    try {
        const deeplClient = new deepl.DeepLClient(process.env.DEEPL_API_KEY);
        const outputPath = './docs/' + `${Date.now()}_${targetLanguage}.pptx`;
        const result = await deeplClient.translateDocument(inputPath, outputPath,null, targetLanguage);
        return {
            status: 'success',
            outputPath: outputPath,
            targetLanguage: targetLanguage,
        };
    } catch (error) {
        console.log('error', error);
        return {
            status: 'failed',
            error: error,
            message: 'Failed to translate PPT',
        };
    }
    
}
