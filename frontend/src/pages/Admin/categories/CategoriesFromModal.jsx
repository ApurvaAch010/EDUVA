import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "../../../components/spinner/spinner";

export const CategoryFormModal = ({ mode, category, onSave, onCancel, loading }) => {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name: category?.name ?? "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Category name is required");
      return;
    }

    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card update-modal category-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? "Update Category" : "Add Category"}</h2>
          <button className="modal-close-btn" onClick={onCancel} disabled={loading}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form className="update-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. Stationery"
                required
                autoFocus
              />
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
                  <FontAwesomeIcon icon={faCheck} /> {isEdit ? "Save Changes" : "Add Category"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};