import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { addBanner, deleteBanner, getAllBanners, toggleBanner, updateBanner } from "./banner.controller.js";
import uploader from "../../middlewares/uploader.middleware.js";


const bannerRouter=express.Router();

bannerRouter.post("/", authMiddleware, roleMiddleware("admin", "mod"), 
  uploader.handle(uploader.single("banner")),
  addBanner
);
bannerRouter.get("/", getAllBanners);                      
                                 
bannerRouter.put("/:id", authMiddleware, roleMiddleware("admin","mod"),
  uploader.handle(uploader.single("banner")),updateBanner);                                  
bannerRouter.delete("/:id", authMiddleware, roleMiddleware("admin"), 
  deleteBanner);                                                               
bannerRouter.patch("/:id/toggle", authMiddleware, roleMiddleware("admin","mod"), 
  toggleBanner);    

export default bannerRouter