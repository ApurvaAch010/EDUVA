import passport from "../../config/passport.config.js";
import { generateActiveToken, generateRefreshToken } from "./auth.service.js";
import dbPool from "../../config/db.config.js";

// GET /auth/google — initiate OAuth flow
export const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false
});

// GET /auth/google/callback — called by Google after login
export const googleCallback = [
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
  }),
  async (req, res) => {
    try {
      const user = req.user;

      const activeToken = generateActiveToken(user);
      const refreshToken = generateRefreshToken(user);

      // Save tokens to users table (same as regular login)
      await dbPool.execute(
        "UPDATE users SET active_tokens = ?, refresh_tokens = ? WHERE id = ?",
        [activeToken, refreshToken, user.id]
      );

      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(
        `${frontendUrl}/auth/callback?activeToken=${activeToken}&refreshToken=${refreshToken}`
      );
    } catch (error) {
      console.error("Error in Google callback controller:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/login?error=server_error`);
    }
  }
];
