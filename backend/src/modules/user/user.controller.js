import { dashboardService, findUserByIdService, getAllUsersService, updateUserByIdService, getAdminStatsService } from "./user.service.js";
import fs from "fs";

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

export const findUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await findUserByIdService(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: result.message
      });
    }
    return res.status(200).json({
      success: true,
      message: "User found",
      data: result
    });
  }
  catch (err) {
    console.error("Error in findUserById controller:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
}

export const getMe = async (req, res) => {
  try {
    const result = await findUserByIdService(req.user.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: result.message
      });
    }
    return res.status(200).json({
      success: true,
      message: "User found",
      data: result
    });
  }
  catch (err) {
    console.error("Error in getMe controller:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
}


export const updateUser = async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  const requesterId = req.user.id;
  const requesterRole = req.user.role;


  if (requesterId !== parseInt(id) && requesterRole !== "admin") {
    if (req.file) fs.unlink(req.file.path, () => { });
    return res.status(403).json({
      success: false,
      message: "You can only update your own profile",
    });
  }

  if (requesterRole === "admin" && requesterId !== parseInt(id)) {
    delete req.body.profilePic;
    if (req.file) fs.unlink(req.file.path, () => { });
  }

  const user = await findUserByIdService(id);
  if (!user) {

    if (req.file) fs.unlink(req.file.path, () => { });
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }


  if (req.file) {
    body.profilePic = req.file.path;
  }

  const result = await updateUserByIdService(id, body);
  if (!result) {
    if (req.file) fs.unlink(req.file.path, () => { });
    return res.status(500).json({
      success: false,
      message: "Update user failed",
    });
  }

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: result,
  });
};

export const getAllUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const filter = req.query.filter || null;

    const result = await getAllUsersService(limit, page, filter);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      ...result,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const result = await getAdminStatsService();
    return res.status(200).json({
      success: true,
      message: "Admin statistics fetched successfully",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

