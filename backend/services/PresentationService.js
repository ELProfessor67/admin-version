import axios from "axios";
import fs from "fs";
import FormData from 'form-data';
import "dotenv/config";


const parseLooseJson = (str) => {
    // 1️⃣ Replace single quotes or unquoted keys
    const fixed = str
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // wrap keys with quotes
      .replace(/'/g, '"'); // replace single quotes with double quotes
  
    // 2️⃣ Try parse
    try {
      return JSON.parse(fixed);
    } catch (err) {
      console.error("❌ Invalid JSON:", str);
      return null;
    }
}


const checkStatus = async (id) => {
    try {
        const response = await axios.get(`${process.env.CONVERSION_API_URL}/status?id=${id}`);
        const pasreResponse = parseLooseJson(response.data);

        if(pasreResponse.status === 'success'){
            return pasreResponse
        }else if(pasreResponse.status === 'inprogress' || pasreResponse.status === 'wait'){
            await new Promise(resolve => setTimeout(resolve, 1000));
            return checkStatus(id);
        }else{
            throw new Error('Conversion Error');
        }
    }catch(error){
        throw new Error('Conversion Error');
    }
}
  

export const convertPresentation = async (presentationUrl,fileName) => {
    try {
        const stream = fs.createReadStream(presentationUrl);
        const formData = new FormData();
        formData.append(fileName, stream);

        const response = await axios.post(`${process.env.CONVERSION_API_URL}/XmlRequestHandler`, formData, {
            maxBodyLength: Infinity,
            headers: {
                ...formData.getHeaders()
            }
        });
        const pasreResponse = parseLooseJson(response.data);
        const status = await checkStatus(pasreResponse.id);
        return pasreResponse;
    }catch(error){
        console.log('error', error);
        return {
            status: 'failed',
            error: 'Conversion Error',
            message: 'Failed to convert presentation'
        }
    }
}