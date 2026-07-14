import "./navbar.css"
import logo from "../../assets/logo.jpeg"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faBarsStaggered, faXmark, faUser,faUserSecret, faRightFromBracket, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../../store/authSlice";
import { logoutApi } from "../../services/auth.service";
import { toast } from "react-toastify";


const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

const imgSrc = (path, updatedAt) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const base = `${BASE_URL}/${path.replace(/^\//, "")}`;
    return updatedAt ? `${base}?t=${new Date(updatedAt).getTime()}` : base;
};


export const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems = [] } = useSelector((state) => state.cart || { items: [] });
  const cartItemCount = Array.isArray(cartItems) ? cartItems.length : 0;
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutApi();
    dispatch(clearUser());
    toast.success("Logged out successfully");
    setDropdownOpen(false);
    navigate("/");
  };
  return (
    <nav>
      <div className="logo" onClick={() => navigate("/")}>
        <img src={logo} alt="logo" />
      </div>

      <div className="hamburger" onClick={() => setIsOpen(prev => !prev)}>
        <FontAwesomeIcon icon={faBarsStaggered} />
      </div>

      <div className={`navigation-links ${isOpen ? "active" : ""}`}>
        <FontAwesomeIcon icon={faXmark} className="close-icon" onClick={() => setIsOpen(false)} />
        <ul className="navbar-items">
          <li><a href="/" onClick={() => setIsOpen(false)}>Home</a></li>
          <li><a href="/products" onClick={() => setIsOpen(false)}>Products</a></li>
          <li><a href="#" onClick={() => setIsOpen(false)}>About</a></li>
          <li><a href="#" onClick={() => setIsOpen(false)}>Contact</a></li>
          {isAuthenticated && <li className="cart" onClick={() => { setIsOpen(false); navigate("/user/cart") }} >
            <FontAwesomeIcon icon={faShoppingCart} color="#000000" /><sup>{cartItemCount}</sup>
          </li>}
        </ul>
      </div>

      <div className="auth-buttons">
        {isAuthenticated ? (
          <div className="profile-wrapper" ref={dropdownRef}>
            <button
              className="profile-btn"
              onClick={() => setDropdownOpen(prev => !prev)}
            >
              <div className="profile-avatar">
                {imgSrc(user?.profile_pic) ? (
                  <img
                    src={imgSrc(user?.profile_pic, user?.updated_at)}
                    alt="profile"
                    className="ud-profile-img"
                  />
                ) : (
                  <div className="ud-profile-avatar-fallback">
                    <FontAwesomeIcon icon={faUserSecret} />
                  </div>
                )}
              </div>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`profile-chevron ${dropdownOpen ? "profile-chevron--open" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <p className="profile-dropdown-name">{user?.username}</p>
                  <p className="profile-dropdown-email">{user?.email}</p>
                </div>
                <hr className="profile-dropdown-divider" />
                <button
                  className="profile-dropdown-item"
                  onClick={() => { navigate(`${user.role === "admin" ? "/admin" : "/user"}`); setDropdownOpen(false); }}
                >
                  <FontAwesomeIcon icon={faUser} />
                  Profile
                </button>
                <button
                  className="profile-dropdown-item profile-dropdown-item--logout"
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="btn btn-login"
            onClick={() => { setIsOpen(false); navigate("/auth"); }}
          >
            Sign In / Sign Up
          </button>
        )}
      </div>
    </nav>
  );
};