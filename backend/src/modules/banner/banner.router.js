import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { addBanner, deleteBanner, getAllBanners, toggleBanner, updateBanner } from "./banner.controller.js";
import uploader from "../../middlewares/uploader.middleware.js";
import { cacheMiddleware, invalidateCache } from "../../middlewares/cache.middleware.js";

const bannerRouter = express.Router();

bannerRouter.post("/", authMiddleware, roleMiddleware("admin", "mod"), 
  uploader.handle(uploader.single("banner")),
  invalidateCache("banners"),
  addBanner
);
bannerRouter.get("/", cacheMiddleware("banners", 600), getAllBanners);                      
                                 
bannerRouter.put("/:id", authMiddleware, roleMiddleware("admin","mod"),
  uploader.handle(uploader.single("banner")),
  invalidateCache("banners"),
  updateBanner
);                                  
bannerRouter.delete("/:id", authMiddleware, roleMiddleware("admin"), 
  invalidateCache("banners"),
  deleteBanner
);                                                               
bannerRouter.patch("/:id/toggle", authMiddleware, roleMiddleware("admin","mod"), 
  invalidateCache("banners"),
  toggleBanner
);    

export default bannerRouter;