import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCartApi } from "../../services/cart.service";
import { placeOrderApi } from "../../services/order.service";
import { Spinner } from "../../components/spinner/spinner";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import "./CheckoutPage.css";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

const imgSrc = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
};

const currency = (n) => `Rs. ${Number(n).toLocaleString("en-IN")}`;

export const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [formData, setFormData] = useState({
    shipping_address: "",
    primary_phone: "",
    secondary_phone: "",
  });

  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      const data = await getCartApi();
      setCart(data.data ?? null);
      if (!data.data || !data.data.items || data.data.items.length === 0) {
        navigate("/user/cart");
      }
    } catch (err) {
      toast.error("Failed to load cart for checkout.");
      navigate("/user/cart");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!formData.shipping_address || !formData.primary_phone) {
      toast.error("Please fill all required fields.");
      return;
    }

    setPlacingOrder(true);
    try {
      await placeOrderApi(formData);
      toast.success("Order placed successfully!");
      navigate("/user/orders");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <Spinner size={36} color="#2d7a5f" />
        <p>Preparing your checkout...</p>
      </div>
    );
  }

  if (!cart) return null;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-left">
          <h2>Shipping Information</h2>
          <p className="checkout-subtitle">Where should we deliver your order?</p>

          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            <div className="form-group">
              <label htmlFor="shipping_address">Delivery Address *</label>
              <textarea
                id="shipping_address"
                name="shipping_address"
                placeholder="Enter your full street address, apartment, building, block, city..."
                value={formData.shipping_address}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="primary_phone">Primary Phone *</label>
                <input
                  type="text"
                  id="primary_phone"
                  name="primary_phone"
                  placeholder="e.g. 9812345678"
                  value={formData.primary_phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="secondary_phone">Secondary Phone (Optional)</label>
                <input
                  type="text"
                  id="secondary_phone"
                  name="secondary_phone"
                  placeholder="e.g. 9800000000"
                  value={formData.secondary_phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="security-notice">
              <FontAwesomeIcon icon={faShieldAlt} className="security-icon" />
              <span>Your personal information is secure and encrypted.</span>
            </div>

            <button
              type="submit"
              className="checkout-submit-btn"
              disabled={placingOrder}
            >
              {placingOrder ? (
                <>
                  <Spinner size={18} color="#fff" />
                  Processing...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} /> Place Order
                </>
              )}
            </button>
          </form>
        </div>

        <div className="checkout-right">
          <div className="checkout-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cart.items.map((item) => (
                <div className="summary-item" key={item.cart_items_id}>
                  <div className="summary-item-img-container">
                    {imgSrc(item.image) ? (
                      <img src={imgSrc(item.image)} alt={item.name} className="summary-item-img" />
                    ) : (
                      <div className="summary-item-placeholder" />
                    )}
                    <span className="summary-item-badge">{item.quantity}</span>
                  </div>
                  <div className="summary-item-details">
                    <p className="summary-item-name">{item.name}</p>
                    <p className="summary-item-price">
                      {item.discount_price ? currency(item.effective_price) : currency(item.price)}
                    </p>
                  </div>
                  <div className="summary-item-subtotal">
                    {currency(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{currency(cart.total)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-shipping">Free</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-total-row">
                <span>Total</span>
                <span>{currency(cart.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};