import { useEffect, useState } from "react"; // <-- Add useState
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../../store/authSlice";
import { getMeApi } from "../../services/auth.service";
import {Spinner} from "../spinner/spinner.jsx"

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true); //

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getMeApi();
        if (res.success) {
          dispatch(setUser(res.data.user));
        } else {
          dispatch(clearUser());
        }
      } catch (error) {
        dispatch(clearUser());
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