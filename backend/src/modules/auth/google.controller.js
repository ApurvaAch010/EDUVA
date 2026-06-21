import passport from "../../config/passport.config.js";

// GET /auth/google — initiate OAuth flow
export const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false
});

// GET /auth/google/callback — called by Google after login
export const googleCallback = [
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/*`
  }),
  async (req, res) => {
    try {
      const { activeToken, refreshToken, user } = req.user;

      res.cookie("token", activeToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(
        `${frontendUrl}`
      );
    } catch (error) {
      console.error("Error in Google callback controller:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(`${frontendUrl}/login?error=server_error`);
    }
  }
];
