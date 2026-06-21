import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
} from "../../services/cart.service";
import { Spinner } from "../../components/spinner/spinner";
import { DeleteModal } from "../../components/modals/DeleteModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faMinus,
  faPlus,
  faCartShopping,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import "./CartPage.css";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

const imgSrc = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
};

const currency = (n) => `Rs. ${Number(n).toLocaleString("en-IN")}`;

export const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCartApi();
      setCart(data.data ?? null);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleQuantityChange = async (item, newQty) => {
    if (newQty < 1) {
      setRemoveTarget(item);
      return;
    }
    setUpdatingId(item.cart_items_id);
    try {
      await updateCartItemApi(item.cart_items_id, newQty);
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message ?? "Could not update quantity.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setActionLoading(true);
    try {
      await removeCartItemApi(removeTarget.cart_items_id);
      setRemoveTarget(null);
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message ?? "Could not remove item.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearCart = async () => {
    setActionLoading(true);
    try {
      await clearCartApi();
      setClearOpen(false);
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message ?? "Could not clear cart.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <Spinner size={36} color="#2d7a5f" />
        <p>Loading your cart…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-empty">
        <p>{error}</p>
        <button className="cart-btn-ghost" onClick={fetchCart}>Retry</button>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <FontAwesomeIcon icon={faCartShopping} className="cart-empty-icon" />
        <h2>Your cart is empty</h2>
        <p>Browse our products and add something you like.</p>
        <button className="cart-btn-primary" onClick={() => navigate("/products")}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <header className="cart-header">
        <h1>My Cart</h1>
        <button className="cart-btn-ghost" onClick={() => setClearOpen(true)}>
          Clear Cart
        </button>
      </header>

      <div className="cart-layout">
    
        <div className="cart-items">
          {cart.items.map((item) => (
            <div className="cart-item" key={item.cart_items_id}>
              {imgSrc(item.image) ? (
                <img src={imgSrc(item.image)} alt={item.name} className="cart-item-img" />
              ) : (
                <div className="cart-item-img-placeholder" />
              )}

              <div className="cart-item-info">
                <p className="cart-item-name">{item.name}</p>
                <p className="cart-item-price">
                  {item.discount_price ? (
                    <>
                      <span className="cart-item-discount">{currency(item.effective_price)}</span>
                      <span className="cart-item-original">{currency(item.price)}</span>
                    </>
                  ) : (
                    currency(item.price)
                  )}
                </p>

                {item.stock <= 5 && item.stock > 0 && (
                  <p className="cart-item-stock-warning">Only {item.stock} left in stock</p>
                )}
                {item.stock === 0 && (
                  <p className="cart-item-stock-out">Out of stock</p>
                )}
              </div>

              <div className="cart-item-qty">
                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(item, item.quantity - 1)}
                  disabled={updatingId === item.cart_items_id}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span className="qty-value">
                  {updatingId === item.cart_items_id ? (
                    <Spinner size={14} color="#2d7a5f" />
                  ) : (
                    item.quantity
                  )}
                </span>
                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(item, item.quantity + 1)}
                  disabled={updatingId === item.cart_items_id || item.quantity >= item.stock}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>

              <div className="cart-item-subtotal">{currency(item.subtotal)}</div>

              <button
                className="cart-item-remove"
                onClick={() => setRemoveTarget(item)}
                title="Remove item"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
        </div>

        {/* summary */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-summary-row">
            <span>Items ({cart.item_count})</span>
            <span>{currency(cart.total)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping</span>
            <span className="cart-summary-free">Calculated at checkout</span>
          </div>
          <div className="cart-summary-divider" />
          <div className="cart-summary-total">
            <span>Total</span>
            <span>{currency(cart.total)}</span>
          </div>

          <button
            className="cart-checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>

      {/* remove item modal */}
      {removeTarget && (
        <DeleteModal
          title="Remove Item?"
          message={
            <>
              Remove <strong>"{removeTarget.name}"</strong> from your cart?
            </>
          }
          onConfirm={handleRemove}
          onCancel={() => setRemoveTarget(null)}
          loading={actionLoading}
        />
      )}

      {/* clear cart modal */}
      {clearOpen && (
        <DeleteModal
          title="Clear Cart?"
          message="This will remove all items from your cart. This action cannot be undone."
          onConfirm={handleClearCart}
          onCancel={() => setClearOpen(false)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};