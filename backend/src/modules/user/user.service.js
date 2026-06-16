import dbPool from "../../config/db.config.js";
import fs from "fs";


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


export const findUserByIdService = async (userId) => {
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
                role: user.role,
                profile_pic: user.profile_pic
            }
        };
    }
    catch (err) {
        throw err;
    }
}




export const updateUserByIdService = async (userId, data) => {
    try {
        const [users] = await dbPool.execute(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );
        if (users.length === 0) throw new Error("Invalid user id");

        const user = users[0];

        if (data.email && data.email !== user.email) {
            const [checkEmail] = await dbPool.execute(
                "SELECT id FROM users WHERE email = ?",
                [data.email]
            );
            if (checkEmail.length > 0) throw new Error("Email already exists");
        }


        if (data.profilePic && user.profile_pic) {
            fs.unlink(user.profile_pic, (err) => {
                if (err) console.error("Failed to delete old profile pic:", err);
            });
        }

        const updated = {
            username: data.username ?? user.username,
            email: data.email ?? user.email,
            organization: data.organization ?? user.organization,
            role: data.role ?? user.role,
            profilePic: data.profilePic ?? user.profile_pic,
        };

        const [result] = await dbPool.execute(
            "UPDATE users SET username=?, email=?, organization=?, role=?, profile_pic=? WHERE id=?",
            [updated.username, updated.email, updated.organization, updated.role, updated.profilePic, userId]
        );

        if (result.affectedRows === 0) throw new Error("Failed to update user");

        return { id: userId, ...updated };
    } catch (err) {

        throw err;
    }
};

export const getAllUsersService = async (limit, page, filter) => {
    try {
        const parsedLimit = parseInt(limit);
        const parsedOffset = parseInt((page - 1) * limit);
        const params = [];

        let dataQuery = "SELECT id, username, email, organization, role, profile_pic, created_at FROM users";
        let totalQuery = "SELECT COUNT(*) as count FROM users";

        if (filter) {
            dataQuery += " WHERE username LIKE ? OR email LIKE ?";
            totalQuery += " WHERE username LIKE ? OR email LIKE ?";
            params.push(`%${filter}%`, `%${filter}%`);
        }

        dataQuery += " LIMIT ? OFFSET ?";

        const [total] = await dbPool.query(totalQuery, params);
const [users] = await dbPool.query(dataQuery, [...params, parsedLimit, parsedOffset]);

        return {
            total: total[0].count,
            page,
            limit: parsedLimit,
            totalPages: Math.ceil(total[0].count / parsedLimit),
            data: users,
        };
    } catch (err) {
        throw err;
    }
};