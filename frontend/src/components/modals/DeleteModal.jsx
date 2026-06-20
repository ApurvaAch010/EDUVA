
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "../spinner/spinner";
import "../../pages/Admin/products/ProductsPage.css";

export const DeleteModal = ({ title, message, onConfirm, onCancel, loading }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-card delete-modal" onClick={(e) => e.stopPropagation()}>{/* e.stopPropagation will not let the modal close even if i click on the other parts of modal */}
      <div className="modal-icon-wrap danger">
        <FontAwesomeIcon icon={faTrash} />
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="modal-actions">
        <button className="btn-ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size={16} color="#fff" /> : "Yes, Delete"}
        </button>
      </div>
    </div>
  </div>
);