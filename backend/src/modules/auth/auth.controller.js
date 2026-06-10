import { registerUser, loginUser, revokeRefreshToken, dashboardService, forgetPasswordService, resetPasswordService } from "./auth.service.js";
import { sendOtpEmail } from "../../config/mailer.config.js";
import fs from "fs";

export const register = async (req, res) => {
  try {
    const profilePic = req.file ? req.file.path : null;
    const userData = {
      ...req.body,
      profilePic
    };

    const result = await registerUser(userData);

    return res.status(201).json({
      success: true,
      message: result.message || "User registered successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in registration controller:", error);

    // If an error occurred and a file was uploaded, delete the file to avoid orphans
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file after controller failure:", err);
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: result.message || "Login successful",
      data: result
    });
  } catch (error) {
    console.error("Error in login controller:", error);

    const statusCode = error.message === "Invalid email or password" ? 401 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message === "Invalid email or password" ? error.message : "Internal Server Error",
      error: error.message
    });
  }
};

export const dashboard = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const result = await dashboardService(req.user.id);
    if (!result) {
      return res.status(500).json({
        success: false,
        message: "Dashboard failed",
        error: result.message
      });
    }
    return res.status(200).json({
      success: true,
      message: "Dashboard successful",
      data: result
    });

  }
  catch (err) {
    console.error("Error in dashboard controller:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
}

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await forgetPasswordService(email);


    await sendOtpEmail(result.email, result.otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email address. It expires in 10 minutes."
    });
  } catch (error) {
    console.error("Error in forget password controller:", error);
    const statusCode = error.message === "No account found with that email address" ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }
    const result = await resetPasswordService(email, otp, password);
    if (!result) {
      return res.status(500).json({
        success: false,
        message: "Password reset failed",
        error: result.message
      });
    }
    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password."
    });
  } catch (error) {
    console.error("Error in reset password controller:", error);

    const knownErrors = ["Invalid OTP", "OTP has expired. Please request a new one", "No account found with that email address"];
    const statusCode = knownErrors.includes(error.message) ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};



export const logout = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const result = await revokeRefreshToken(req.user.id);

    if (!result) {
      return res.status(500).json({
        success: false,
        message: "Logout failed",
        error: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Error in logout controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};
