// utils/errorHandler.js - New utility file

const loggingService = require('../services/LoggingService');

exports.handleError = async (error, entity, user, description, req, res) => {
  console.error(`${description}:`, error);
  
  // Log the error
  await loggingService.logError(
    entity,
    error,
    user,
    description,
    req
  );
  
  // Create appropriate response
  const errorResponse = { 
    message: description 
  };
  
  // Only expose details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = error.message;
    errorResponse.stack = error.stack;
  }
  
  return res.status(500).json(errorResponse);
};