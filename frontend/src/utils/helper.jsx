import GenerateRandomCode from 'react-random-code-generator';
import moment from 'moment';
import jwt from "jwt-simple";
import pdfIcon from "@/assets/img/pdf.svg";
import wordIcon from "@/assets/img/doc.svg";
import xlsIcon from "@/assets/img/xls.svg";
import imageIcon from "@/assets/img/jpg.svg";
import pptIcon from "@/assets/img/ppt.svg";
import { REACT_APP_JWT_SECRET } from '@/constants/URLConstant';
import {decodeToken} from "@/service/auth/authService"
const randomCodeGenerator = () => {
    return GenerateRandomCode.NumCode(10);
}

const calculateMinTime = (date) => {
    let isToday = moment(date).isSame(moment(), "day");
    if (isToday) {
        let nowAddOneHour = moment(new Date())
            .add({ minute: 0 })
            .toDate();
        return nowAddOneHour;
    }
    return moment()
        .startOf("day")
        .toDate();
};
const renderResourceIcon = type => {
    switch (type) {
        case "pdf":
            return pdfIcon;
        case "doc":
            return wordIcon;
        case "docx":
            return wordIcon;
        case "xls":
            return xlsIcon;
        case "xlsx":
            return xlsIcon;
        case "jpg":
            return imageIcon;
        case "jpeg":
            return imageIcon;
        case "png":
            return imageIcon;
        case "ppt":
            return pptIcon;
        case "pptx":
            return pptIcon;
        default:
            return pdfIcon;
    }
};

const getDate = (d) => {
    let m = new Date(d)
    m.setHours(0)
    m.setMinutes(0)
    m.setSeconds(0)
    return new Date(m)
}

const decodeEncodedItem = async (decodedItem) => {

    if (decodedItem !== "" && decodedItem !== undefined && decodedItem !== null) {
        decodedItem = JSON.parse(
            decodedItem
        );
        
        const res = await decodeToken(decodedItem)
        decodedItem = res.data.data;
        // decodedItem = jwt.decode(decodedItem, REACT_APP_JWT_SECRET, 'HS512');
    }
    return decodedItem;
}

const Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const getUserRole = (role) => {
    switch (role) {
        case 's':
            return 'speaker';
        case 'm':
            return 'moderator';
        case 'l':
            return 'listener';
        case 'i':
            return 'interpreter';
        case 'a':
            return 'moderator-s';
        default:
            return false;
    }
}

export const helper = {
    randomCodeGenerator: randomCodeGenerator,
    calculateMinTime: calculateMinTime,
    renderResourceIcon: renderResourceIcon,
    getDate: getDate,
    decodeEncodedItem: decodeEncodedItem,
    Capitalize:Capitalize, 
    getUserRole:getUserRole
}

export default helper