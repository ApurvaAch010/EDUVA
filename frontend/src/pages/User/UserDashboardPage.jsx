import { useSelector, useDispatch } from "react-redux";
import "./UserDashboardPage.css";
import { faPen, faUserSecret } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ProfileUpdateModal } from "./ProfileUpdateForm";
import { useEffect, useState } from "react";
import { setUser } from "../../store/authSlice";
import { updateUserApi } from "../../services/users.service";
import { toast } from "react-toastify"

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

const imgSrc = (path, updatedAt) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const base = `${BASE_URL}/${path.replace(/^\//, "")}`;
    return updatedAt ? `${base}?t=${new Date(updatedAt).getTime()}` : base;
};

export const UserDashboardPage = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [updateTarget, setUpdateTarget] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleUpdate = async (formData) => {
        setSaving(true);
        try {


            const res = await updateUserApi(user.id, formData);
            
            if (res?.success) {
                dispatch(setUser(res.data ?? res.user));
                toast.success(res.message);
                setUpdateTarget(null);
            } else {
                toast.error(res?.message ?? "Update failed.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message ?? "Update failed.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="main-ud">
                <h1 className="ud-title">
                    Welcome <span className="text-ud-title">{user?.username?.toUpperCase()}</span>!
                </h1>

                <div className="ud-content">
                    <button
                        className="update-pen"
                        onClick={() => setUpdateTarget(user)}
                        aria-label="Edit profile"
                    >
                        <FontAwesomeIcon icon={faPen} />
                    </button>

                    <div className="profile">
                        {imgSrc(user?.profile_pic) ? (
                            <img
                                src={imgSrc(user?.profile_pic, user?.updated_at)}
                                alt="profile"
                                className="ud-profile-img"
                            />
                        ) : (
                            <div className="ud-profile-avatar-fallback">
                                <FontAwesomeIcon icon={faUserSecret} />
                            </div>
                        )}
                    </div>

                    <div className="profile-info">
                        <div className="field">
                            <label>Username</label>
                            <input type="text" value={user?.username ?? ""} disabled />
                        </div>
                        <div className="field">
                            <label>Email</label>
                            <input type="email" value={user?.email ?? ""} disabled />
                        </div>
                        <div className="field">
                            <label>Organization</label>
                            <input type="text" value={user?.organization ?? ""} disabled />
                        </div>
                    </div>
                </div>
            </div>

            {updateTarget && (
                <ProfileUpdateModal
                    user={user}
                    onSave={handleUpdate}
                    onCancel={() => setUpdateTarget(null)}
                    loading={saving}
                />
            )}
        </>
    );
};