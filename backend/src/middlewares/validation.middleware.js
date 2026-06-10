import fs from "fs";

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, 
      allowUnknown: true, 
      stripUnknown: true 
    });

    if (error) {
      // If validation fails and a file was uploaded by multer, clean it up/delete it
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file after validation failure:", err);
        });
      }
      
      if (req.files) {
        // Handle array or object files if multiple uploads were used
        const filesArray = Array.isArray(req.files) 
          ? req.files 
          : Object.values(req.files).flat();
          
        filesArray.forEach((file) => {
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting file after validation failure:", err);
          });
        });
      }

      // Map validation errors into a user-friendly format
      const errorDetails = {};
      error.details.forEach((errDetail) => {
        const key = errDetail.path[0];
        errorDetails[key] = errDetail.message.replace(/['"]/g, "");
      });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorDetails
      });
    }

    // Replace req.body with the validated and sanitized value
    req.body = value;
    next();
  };
};

export default validateRequest;
