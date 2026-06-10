import express from "express";
import { googleLogin, googleCallback } from "./google.controller.js";

const googleRouter = express.Router();

googleRouter.get("/google", googleLogin);
googleRouter.get("/google/callback", googleCallback);

export default googleRouter;
