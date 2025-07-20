export const sanitizeFileName = (filename) => {
    const nameWithoutExt = filename.substr(0, filename.lastIndexOf('.')).trim();
    return nameWithoutExt.replace(/[^a-z0-9]/gi, " ").toLowerCase();
}
