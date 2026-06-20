import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "../../../components/spinner/spinner";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

const imgSrc = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
};

const currency = (n) => `Rs. ${Number(n).toLocaleString("en-IN")}`;

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export const OrderDetailModal = ({ order, onUpdateStatus, onCancel, loading }) => {
  const [status, setStatus] = useState(order?.status ?? "pending");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (status === order.status) {
      onCancel();
      return;
    }
    onUpdateStatus(status);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card update-modal order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order #{order.order_id}</h2>
          <button className="modal-close-btn" onClick={onCancel} disabled={loading}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* customer info */}
        <div className="order-info-grid">
          <div>
            <span className="order-info-label">Customer</span>
            <p>{order.username ?? "—"}</p>
          </div>
          <div>
            <span className="order-info-label">Email</span>
            <p>{order.email ?? "—"}</p>
          </div>
          <div>
            <span className="order-info-label">Primary Phone</span>
            <p>{order.primary_phone ?? "—"}</p>
          </div>
          {order.secondary_phone && (
            <div>
              <span className="order-info-label">Secondary Phone</span>
              <p>{order.secondary_phone}</p>
            </div>
          )}
          <div className="order-info-full">
            <span className="order-info-label">Shipping Address</span>
            <p>{order.shipping_address}</p>
          </div>
        </div>

        {/* items */}
        <div className="order-items-section">
          <span className="order-info-label">Items</span>
          <div className="order-items-list">
            {order.items?.map((item) => (
              <div className="order-item-row" key={item.order_item_id}>
                {imgSrc(item.image) && (
                  <img src={imgSrc(item.image)} alt={item.name} className="order-item-thumb" />
                )}
                <div className="order-item-info">
                  <p className="order-item-name">{item.name}</p>
                  <p className="order-item-meta">
                    Qty: {item.quantity} × {currency(item.discount_price || item.price)}
                  </p>
                </div>
                <div className="order-item-subtotal">
                  {currency(item.quantity * (item.discount_price || item.price))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-total-row">
          <span>Total</span>
          <strong>{currency(order.total_amount)}</strong>
        </div>

        {/* status update form */}
        <form className="update-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full">
              <label>Order Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="order-status-select">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onCancel} disabled={loading}>
              Close
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <Spinner size={16} color="#fff" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} /> Update Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};