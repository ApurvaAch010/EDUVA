import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbPool from "../../config/db.config.js";

export const generateActiveToken = (user) => {
  return jwt.sign(
    { id: user.id || user.userId, email: user.email, role: user.role || "user" },
    process.env.JWT_ACTIVE_SECRET,
    { expiresIn: process.env.JWT_ACTIVE_EXPIRES_IN }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id || user.userId, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
};

export const registerUser = async (userData) => {
  const { username, email, password, organization, profilePic, role } = userData;
  const userRole = role || "user";
 let passwordHash = null;

  if (userData.password) {
    const salt = await bcrypt.genSalt(10);
    passwordHash = await bcrypt.hash(userData.password, salt);
  }
  const sql = `
    INSERT INTO users (username, email, password, organization, profile_pic, role, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;
  const values = [username, email, passwordHash, organization, profilePic || null, userRole];
  try {

    const [result] = await dbPool.execute(sql, values);
    return {
      success: true,
      userId: result.insertId,
      user: { username, email, organization, profilePic, role: userRole }
    };
  } catch (error) {
    console.warn("Database operation failed: ", error.message);

    // If the table doesn't exist, simulate a successful operation as requested by the user
    if (error.code === "ER_NO_SUCH_TABLE" || error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      console.log("Simulating registration success because database or table is not ready.");
      return {
        success: true,
        simulated: true,
        message: "Registration logic completed. (Database table 'users' not found or offline - running in simulation mode).",
        user: {
          username,
          email,
          organization,
          profilePic: profilePic || null,
          role: userRole,
          passwordHash
        }
      };
    }

    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const [users] = await dbPool.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = users[0];

    if (!user.password) {
      throw new Error("This account was created with Google. Please log in with Google.");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new Error("Invalid email or password");
    }

    const activeToken = generateActiveToken(user);
    const refreshToken = generateRefreshToken(user);

    await dbPool.execute(
      "UPDATE users SET active_tokens = ?, refresh_tokens = ? WHERE id = ?",
      [activeToken, refreshToken, user.id]
    );

    return {
      success: true,
      activeToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        organization: user.organization,
        role: user.role,
        profilePic: user.profile_pic
      }
    };
  } catch (error) {
    if (
      error.code === "ER_NO_SUCH_TABLE" ||
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND"
    ) {
      console.log("Simulating login success because database or table is not ready.");
      const mockUser = {
        id: 999,
        username: email.split("@")[0],
        email: email,
        organization: "Simulated Org",
        role: "user"
      };

      const activeToken = generateActiveToken(mockUser);
      const refreshToken = generateRefreshToken(mockUser);

      return {
        success: true,
        simulated: true,
        message: "Logged in. (Database table 'users' not found or offline - running in simulation mode).",
        activeToken,
        refreshToken,
        user: mockUser
      };
    }

    throw error;
  }
};

export const findOrCreateGoogleUser = async (email, firstName, lastName, profilePic) => {
  const [users] = await dbPool.execute("SELECT * FROM users WHERE email = ?", [email]);
  let user;

  if (users.length === 0) {
    const newUser = {
      username: `${firstName} ${lastName}`,
      email,
      profilePic,
      organization: "Google",
      role: "user"
    };
    const result = await registerUser(newUser);
    user = { ...result.user, id: result.userId || result.user.id };
  } else {
    user = users[0];
  }

  const activeToken = generateActiveToken(user);
  const refreshToken = generateRefreshToken(user);

  await dbPool.execute(
    "UPDATE users SET active_tokens = ?, refresh_tokens = ? WHERE id = ?",
    [activeToken, refreshToken, user.id]
  );
  return {
    success: true,
    activeToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      organization: user.organization,
      role: user.role,
      profilePic: user.profile_pic
    }
  };
}

export const dashboardService = async (userId) => {
  try {
    const [users] = await dbPool.execute("SELECT * FROM users WHERE id = ?", [userId]);
    if (users.length === 0) {
      throw new Error("Invalid user id");
    }

    const user = users[0];
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        organization: user.organization,
        role: user.role
      }
    };
  }
  catch (err) {
    throw err;
  }
}

export const forgetPasswordService = async (email) => {
  const [users] = await dbPool.execute("SELECT * FROM users WHERE email = ?", [email]);
  if (users.length === 0) {
    throw new Error("No account found with that email address");
  }

  const otp = String(Math.floor(10000 + Math.random() * 90000));
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await dbPool.execute(
    "UPDATE users SET otp = ?, otp_expires_at = ? WHERE email = ?",
    [otp, otpExpiresAt, email]
  );

  return { otp, email };
};

export const resetPasswordService = async (email, otp, password) => {
  const [users] = await dbPool.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (users.length === 0) {
    throw new Error("No account found with that email address");
  }

  const user = users[0];

  if (!user.otp || user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
    throw new Error("OTP has expired. Please request a new one");
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);


  await dbPool.execute(
    "UPDATE users SET password = ?, otp = NULL, otp_expires_at = NULL WHERE email = ?",
    [passwordHash, email]
  );

  return true;
};


export const revokeRefreshToken = async (userId) => {
  try {
    await dbPool.execute(
      "UPDATE users SET active_tokens = NULL, refresh_tokens = NULL WHERE id = ?",
      [userId]
    );

    

    return true;
  } catch (error) {
    if (
      error.code === "ER_NO_SUCH_TABLE" ||
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND"
    ) {
      return true;
    }
    throw error;
  }
};
