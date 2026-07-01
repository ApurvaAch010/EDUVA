import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrdersApi, cancelOrderApi } from "../../services/order.service";
import { Spinner } from "../../components/spinner/spinner";
import { DeleteModal } from "../../components/modals/DeleteModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import "./OrderPage.css";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

const imgSrc = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
};

const currency = (n) => `Rs. ${Number(n).toLocaleString("en-IN")}`;

const STATUS_STYLES = {
  pending:    { background: "#fffbeb", color: "#d97706" },
  processing: { background: "#eff6ff", color: "#2563eb" },
  shipped:    { background: "#f5f3ff", color: "#7c3aed" },
  delivered:  { background: "#ecfdf5", color: "#059669" },
  cancelled:  { background: "#fef2f2", color: "#dc2626" },
};

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyOrdersApi();
      setOrders(data.orders ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(true);
    try {
      await cancelOrderApi(cancelTarget.order_id);
      setCancelTarget(null);
      toast.success("Order cancelled successfully")
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Could not cancel order.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <Spinner size={36} color="#2d7a5f" />
        <p>Loading your orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-empty">
        <p>{error}</p>
        <button className="orders-btn-ghost" onClick={fetchOrders}>Retry</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-empty">
        <FontAwesomeIcon icon={faBoxOpen} className="orders-empty-icon" />
        <h2>No orders yet</h2>
        <p>Once you place an order, it'll show up here.</p>
        <button className="orders-btn-primary" onClick={() => navigate("/products")}>
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <header className="orders-header">
        <h1>My Orders</h1>
        <p className="orders-subtitle">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
      </header>

      <div className="orders-list">
        {orders.map((order) => {
          const isExpanded = expandedId === order.order_id;
          const canCancel = ["pending", "processing"].includes(order.status);

          return (
            <div className="order-card" key={order.order_id}>
              <div
                className="order-card-header"
                onClick={() => setExpandedId(isExpanded ? null : order.order_id)}
              >
                <div>
                  <p className="order-id">Order #{order.order_id}</p>
                  <p className="order-date">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>

                <div className="order-header-right">
                  <span className="order-total">{currency(order.total_amount)}</span>
                  <span
                    className="order-status-pill"
                    style={STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}
                  >
                    {order.status}
                  </span>
                  <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                </div>
              </div>

              {isExpanded && (
                <div className="order-card-body">
                  <div className="order-items">
                    {order.items?.map((item) => (
                      <div className="order-line-item" key={item.order_item_id}>
                        {imgSrc(item.image) && (
                          <img src={imgSrc(item.image)} alt={item.name} className="order-line-img" />
                        )}
                        <div className="order-line-info">
                          <p className="order-line-name">{item.name}</p>
                          <p className="order-line-meta">
                            Qty: {item.quantity} × {currency(item.discount_price || item.price)}
                          </p>
                        </div>
                        <div className="order-line-subtotal">
                          {currency(item.quantity * (item.discount_price || item.price))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-shipping-info">
                    <div>
                      <span className="order-info-label">Shipping Address</span>
                      <p>{order.shipping_address}</p>
                    </div>
                    <div>
                      <span className="order-info-label">Contact</span>
                      <p>{order.primary_phone}{order.secondary_phone ? `, ${order.secondary_phone}` : ""}</p>
                    </div>
                  </div>

                  {canCancel && (
                    <button
                      className="order-cancel-btn"
                      onClick={(e) => { e.stopPropagation(); setCancelTarget(order); }}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {cancelTarget && (
        <DeleteModal
          title="Cancel Order?"
          message={
            <>
              Are you sure you want to cancel <strong>order #{cancelTarget.order_id}</strong>?
              This action cannot be undone.
            </>
          }
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};