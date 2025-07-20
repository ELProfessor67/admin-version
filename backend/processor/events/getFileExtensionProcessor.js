
export const getFileExtension = (filename) => {
    return filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
}