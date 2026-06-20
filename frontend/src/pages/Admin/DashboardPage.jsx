import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Spinner } from "../../components/spinner/spinner";
import "./DashboardPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faCube, faUsers } from "@fortawesome/free-solid-svg-icons";

export const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await api.get("/user/admin-stats");
                if (response.data && response.data.success) {
                    setStats(response.data.data);
                } else {
                    setError("Failed to fetch dashboard statistics");
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
                setError(err.response?.data?.message || "An error occurred while loading dashboard stats");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <Spinner size={40} color="#3b82f6" />
                <p style={{ marginTop: "1rem" }}>Loading dashboard analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <div className="error-card">
                    <h2>Error Loading Dashboard</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const { totalUsers, totalOrders, pendingOrders, cancelledOrders, userRegistrations, recentOrders } = stats;

    // Calculate Sparkline Path
    const counts = userRegistrations.map((r) => r.count);
    const maxCount = Math.max(...counts, 1);
    const points = userRegistrations.map((item, index) => {
        const x = (index / (userRegistrations.length - 1)) * 140 + 10; // width 160, with 10px padding
        const y = 35 - (item.count / maxCount) * 25; // height 40, with 5px padding top/bottom
        return { x, y };
    });

    const linePath = points.reduce((acc, p, i) => {
        return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
    }, "");

    const areaPath = points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} 40 L ${points[0].x} 40 Z`
        : "";

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1>Overview Dashboard</h1>
                <p className="subtitle">Real-time statistics and summary of your store's activity</p>
            </header>

            <div className="cards-grid">
               
                <div className="dashboard-card card-orders">
                    <div className="card-header">
                        <span className="card-icon"><FontAwesomeIcon icon={faCube} /></span>
                        <h2 className="card-title">Total Orders</h2>
                    </div>
                    <div className="card-body">
                        <p className="card-value">{totalOrders}</p>
                        <p className="card-trend positive">
                            <span className="trend-arrow">↑</span> All time order count
                        </p>
                    </div>
                </div>

                
                <div className="dashboard-card card-status-breakdown">
                    <div className="card-header">
                        <span className="card-icon"><FontAwesomeIcon icon={faBoxOpen} /></span>
                        <h2 className="card-title">Order Status</h2>
                    </div>
                    <div className="card-body status-breakdown">
                        <div className="status-item pending-item">
                            <span className="label">Pending</span>
                            <span className="value">{pendingOrders}</span>
                        </div>
                        <div className="status-item cancelled-item">
                            <span className="label">Cancelled</span>
                            <span className="value">{cancelledOrders}</span>
                        </div>
                    </div>
                </div>

                
                <div className="dashboard-card card-users">
                    <div className="card-header">
                        <span className="card-icon"><FontAwesomeIcon icon={faUsers} /></span>
                        <h2 className="card-title">Total Users</h2>
                    </div>
                    <div className="card-body user-sparkline-container">
                        <div className="user-count-info">
                            <p className="card-value">{totalUsers}</p>
                            <p className="card-trend positive">30-day signup trend</p>
                        </div>
                        <div className="sparkline-wrapper">
                            <svg viewBox="0 0 160 40" className="sparkline-svg">
                                <defs>
                                    <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                    </linearGradient>
                                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#34d399" />
                                        <stop offset="100%" stopColor="#10b981" />
                                    </linearGradient>
                                </defs>
                                {areaPath && <path d={areaPath} fill="url(#sparklineGrad)" />}
                                {linePath && (
                                    <path
                                        d={linePath}
                                        fill="none"
                                        stroke="url(#lineGrad)"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                )}
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

          
            <div className="recent-orders-section">
                <div className="section-header">
                    <h2>Recent Orders</h2>
                    <span className="tag">Latest 5</span>
                </div>
                <div className="table-responsive">
                    <table className="recent-orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-table">
                                        No recent orders found.
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    <tr key={order.order_id}>
                                        <td className="order-id">#{order.order_id}</td>
                                        <td className="customer-name">{order.username}</td>
                                        <td className="customer-email">{order.email}</td>
                                        <td className="order-date">
                                            {new Date(order.created_at).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="order-amount">Rs.{parseFloat(order.total_amount).toFixed(2)}</td>
                                        <td>
                                            <span className={`status-pill ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};