import path from "path";
import fs from "fs";
import fsSync from "fs";
const __dirname = path.resolve();

export const createDirectoryStructure = async (eventId) => {
    const basePath = path.resolve(__dirname, '../uploads');
    const eventPath = path.join(basePath, eventId);
    const eventFilesPath = path.join(eventPath, 'event_files');
  
    try {
      // Create base uploads directory if it doesn't exist
      if (!fsSync.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true });
      }
      
      // Create event directory if it doesn't exist
      if (!fsSync.existsSync(eventPath)) {
        fs.mkdirSync(eventPath, { recursive: true });
      }
      
      // Create event_files directory if it doesn't exist
      if (!fsSync.existsSync(eventFilesPath)) {
        fs.mkdirSync(eventFilesPath, { recursive: true });
      }
    } catch (error) {
      throw new Error(`Directory creation failed: ${error.message}`);
    }
  }