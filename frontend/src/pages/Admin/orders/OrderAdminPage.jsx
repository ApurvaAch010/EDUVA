import { useState, useEffect, useCallback } from "react";
import { getAllOrdersApi, updateOrderStatusApi } from "../../../services/order.service";
import { Spinner } from "../../../components/spinner/spinner";
import { OrderDetailModal } from "./OrderDetailModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faChevronLeft,
  faChevronRight,
  faBoxOpen,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import "../products/ProductsPage.css"; 

const currency = (n) => `Rs. ${Number(n).toLocaleString("en-IN")}`;

const STATUS_STYLES = {
  pending:    { background: "#fffbeb", color: "#d97706" },
  processing: { background: "#eff6ff", color: "#2563eb" },
  shipped:    { background: "#f5f3ff", color: "#7c3aed" },
  delivered:  { background: "#ecfdf5", color: "#059669" },
  cancelled:  { background: "#fef2f2", color: "#dc2626" },
};

export const OrdersAdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const LIMIT = 10;

  const [detailTarget, setDetailTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllOrdersApi({ limit: LIMIT, page, status });
      setOrders(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (newStatus) => {
    if (!detailTarget) return;
    setActionLoading(true);
    try {
      await updateOrderStatusApi(detailTarget.order_id, newStatus);
      setDetailTarget(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message ?? "Status update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="products-page">
      <header className="products-header">
        <div>
          <h1>Orders</h1>
          <p className="subtitle">
            {total} order{total !== 1 ? "s" : ""} placed
          </p>
        </div>
      </header>

      {/* Toolbar */}
      <div className="products-toolbar">
        <div className="sort-box">
          <FontAwesomeIcon icon={faFilter} className="sort-icon" />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="products-section">
        {loading ? (
          <div className="products-loading">
            <Spinner size={36} color="#6366f1" />
            <p>Loading orders…</p>
          </div>
        ) : error ? (
          <div className="products-error">
            <p>{error}</p>
            <button className="btn-ghost" onClick={fetchOrders}>Retry</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="products-empty">
            <FontAwesomeIcon icon={faBoxOpen} className="empty-icon" />
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Placed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.order_id}>
                    <td className="product-name">#{o.order_id}</td>

                    <td>
                      <div className="product-name">{o.username}</div>
                      <div className="product-desc">{o.email}</div>
                    </td>

                    <td className="product-category">
                      {o.items?.length ?? 0} item{o.items?.length !== 1 ? "s" : ""}
                    </td>

                    <td className="product-price">{currency(o.total_amount)}</td>

                    <td>
                      <span
                        className="status-pill"
                        style={STATUS_STYLES[o.status] ?? STATUS_STYLES.pending}
                      >
                        {o.status}
                      </span>
                    </td>

                    <td className="product-category">
                      {new Date(o.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          className="action-btn edit"
                          title="View order"
                          onClick={() => setDetailTarget(o)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span className="page-info">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}

      {/* Order detail / status modal */}
      {detailTarget && (
        <OrderDetailModal
          order={detailTarget}
          onUpdateStatus={handleStatusUpdate}
          onCancel={() => setDetailTarget(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};