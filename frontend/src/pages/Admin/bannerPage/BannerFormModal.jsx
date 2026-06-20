import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck, faImage } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "../../../components/spinner/spinner";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

const imgSrc = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
};

export const BannerFormModal = ({ mode, banner, onSave, onCancel, loading }) => {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    title: banner?.title ?? "",
    description: banner?.description ?? "",
    isActive: banner?.is_active ?? true,
  });
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(isEdit ? imgSrc(banner?.image_path) : null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    if (!isEdit && !newImage) {
      alert("Please upload a banner image");
      return;
    }

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("isActive", form.isActive);
    fd.append("description", form.description);
    if (newImage) fd.append("banner", newImage);

    onSave(fd);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card update-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? "Update Banner" : "Add Banner"}</h2>
          <button className="modal-close-btn" onClick={onCancel} disabled={loading}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form className="update-form" onSubmit={handleSubmit}>
          <div className="update-img-section">
            <label className="update-img-label" htmlFor="banner-img-input">
              {preview ? (
                <img src={preview} alt="preview" className="update-img-preview banner-img-preview" />
              ) : (
                <div className="update-img-placeholder banner-img-placeholder">
                  <FontAwesomeIcon icon={faImage} />
                  <span>Click to add banner image</span>
                </div>
              )}
            </label>
            <input
              id="banner-img-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          <div className="form-grid">
            <div className="form-group full">
              <label>Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={255}
                placeholder="e.g. Summer Sale"
                required
              />
              <label>Description</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. this is a sale banner"
                
              />
            </div>

            <div className="form-group toggle-group full">
              <label>Active</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <Spinner size={16} color="#fff" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} /> {isEdit ? "Save Changes" : "Add Banner"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};