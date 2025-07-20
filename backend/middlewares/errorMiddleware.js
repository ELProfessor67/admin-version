import ErrorHandler from '@/utils/ErrorHandler.js';

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // If the error is not an instance of ErrorHandler, wrap it
  if (!(err instanceof ErrorHandler)) {
    err = new ErrorHandler(message, statusCode);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    statusCode: err.statusCode
  });
};

export default errorMiddleware;
