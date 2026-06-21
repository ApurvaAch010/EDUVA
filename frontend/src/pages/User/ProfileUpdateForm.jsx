import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck, faImage } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "../../components/spinner/spinner";
import "../Admin/products/ProductsPage.css"

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

const imgSrc = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
};

export const ProfileUpdateModal = ({
  user,
  onSave,
  onCancel,
  loading,
}) => {
  const [form, setForm] = useState({
    username: user?.username ?? "",
    organization: user?.organization ?? "",
    email: user?.email ?? "",
  });

  const [newImage, setNewImage] = useState(null);

  const [preview, setPreview] = useState(
    imgSrc(user?.profile_pic)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setNewImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.username.trim()) {
      alert("Username is required");
      return;
    }

    const fd = new FormData();

    fd.append("username", form.username);
    fd.append("organization", form.organization);

    if (newImage) {
      fd.append("profilePic", newImage);
    }

    onSave(fd);
  };

  return (
    <div className="modal-overlay" onClick={onCancel} style={{
      width:"350px"
    }}>
      <div
        className="modal-card update-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Update Profile</h2>

          <button
            className="modal-close-btn"
            onClick={onCancel}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form className="update-form" onSubmit={handleSubmit}>
          <div className="update-img-section">
            <label
              className="update-img-label"
              htmlFor="profile-img-input"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="update-img-preview"
                />
              ) : (
                <div className="update-img-placeholder">
                  <FontAwesomeIcon icon={faImage} />
                  <span>Click to add profile picture</span>
                </div>
              )}
            </label>

            <input
              id="profile-img-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          <div className="form-grid">
            <div className="form-group full">
              <label>Username</label>

              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                maxLength={100}
                required
              />
            </div>

            <div className="form-group full">
              <label>Organization</label>

              <input
                type="text"
                name="organization"
                value={form.organization}
                onChange={handleChange}
                placeholder="Enter organization"
                maxLength={150}
              />
            </div>

            <div className="form-group full">
              <label>Email</label>

              <input
                type="email"
                value={form.email}
                disabled
                className="disabled-input"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <Spinner size={16} color="#fff" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} />
                  {" "}Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};