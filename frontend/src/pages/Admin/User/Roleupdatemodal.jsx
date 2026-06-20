import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "../../../components/spinner/spinner";

const ROLES = ["user", "mod", "admin"];

export const RoleUpdateModal = ({ targetUser, onSave, onCancel, loading }) => {
  const [role, setRole] = useState(targetUser?.role ?? "user");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ role });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card update-modal category-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Update Role</h2>
          <button className="modal-close-btn" onClick={onCancel} disabled={loading}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form className="update-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full">
              <label>User</label>
              <input value={targetUser?.username ?? ""} disabled />
            </div>

            <div className="form-group full">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
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
                  <FontAwesomeIcon icon={faCheck} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};