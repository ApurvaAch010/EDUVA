import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../../store/authSlice";
import { setCart, clearCart } from "../../store/cartSlice";
import { getMeApi } from "../../services/auth.service";
import { getCartApi } from "../../services/cart.service";
import { Spinner } from "../spinner/spinner.jsx";

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getMeApi();
        if (res.success) {
          dispatch(setUser(res.data.user));
          try {
            const cartRes = await getCartApi();
            dispatch(setCart(cartRes.data || []));
          } catch (cartErr) {
            console.error("Failed to fetch cart", cartErr);
            dispatch(setCart([]));
          }
        } else {
          dispatch(clearUser());
          dispatch(clearCart());
        }
      } catch (error) {
        dispatch(clearUser());
        dispatch(clearCart());
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw", backgroundColor: "#f9fafb" }}>
        <Spinner size={40} color="#3b82f6" />
      </div>
    );
  }

  return children;
};