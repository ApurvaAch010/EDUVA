import "./navbar.css"
import logo from "../../assets/logo.jpeg"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faBarsStaggered, faXmark, faUser, faRightFromBracket, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../../store/authSlice";
import { logoutApi } from "../../services/auth.service";
import { toast } from "react-toastify";

export const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
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
      <div className="logo">
        <img src={logo} alt="logo" />
      </div>

      <div className="hamburger" onClick={() => setIsOpen(prev => !prev)}>
        <FontAwesomeIcon icon={faBarsStaggered} />
      </div>

      <div className={`navigation-links ${isOpen ? "active" : ""}`}>
        <FontAwesomeIcon icon={faXmark} className="close-icon" onClick={() => setIsOpen(false)} />
        <ul className="navbar-items">
          <li><a href="#" onClick={() => setIsOpen(false)}>Home</a></li>
          <li><a href="#" onClick={() => setIsOpen(false)}>About</a></li>
          <li><a href="#" onClick={() => setIsOpen(false)}>Contact</a></li>
          <li className="cart" onClick={() => setIsOpen(false)}>
            <FontAwesomeIcon icon={faShoppingCart} color="#000000" /><sup>0</sup>
          </li>
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
                {user?.username?.charAt(0).toUpperCase()}
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
                  onClick={() => { navigate("/profile"); setDropdownOpen(false); }}
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