export const createErrorResponse = (error, message, eventId = null) => {
    const response = {
      status: 'failed',
      error: 'Validation Error',
      message: message
    };
  
    if (error?.code === 'LIMIT_FILE_SIZE') {
      response.message = 'File Size is too large. Allowed file size is 50MB';
    } else if (error?.code === 'ENOENT') {
      response.message = 'No folder exists';
    }
  
    if (eventId) {
      response.eventid = eventId;
    }
  
    return response;
  }