import { Outlet, NavLink, useNavigate } from "react-router-dom";
import "./UserLayout.css";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesLeft,
  faAnglesRight,
  faBoxOpen,
  faCartShopping,
  faGauge,
  faRightFromBracket,
  faUserSecret,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import logo from "../assets/logo.jpeg";
import { clearUser } from "../store/authSlice";
import { logoutApi } from "../services/auth.service";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

const imgSrc = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
};

export const UserLayout = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutApi();
    dispatch(clearUser());
    navigate("/auth");
  };

  // close sidebar automatically after navigating, but only on mobile
  const handleNavClick = () => {
    if (window.innerWidth <= 768) setIsOpen(false);
  };

  const navItems = [
    { to: "/user", label: "User Dashboard", icon: faGauge, end: true },
    { to: "/user/cart", label: "My Cart", icon: faCartShopping },
    { to: "/user/orders", label: "My Orders", icon: faBoxOpen },
  ];

  return (
    <div className="user-wrapper">
      {/* backdrop — only rendered/visible on mobile when sidebar is open */}
      {isOpen && (
        <div className="user-backdrop" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`user-sidebar ${isOpen ? "user-sidebar--open" : "user-sidebar--closed"}`}>
        <div
          className="user-sidebar-logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="logo" className="user-logo-img" />
          {isOpen && <span className="user-logo-text">Eduva</span>}
        </div>

        <div className="user-menu">
          {isOpen && <p className="user-menu-label">Main Menu</p>}

          <ul className="user-nav">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `user-nav-item ${isActive ? "user-nav-item--active" : ""}`
                  }
                >
                  <FontAwesomeIcon icon={item.icon} className="user-nav-icon" />
                  {isOpen && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <button className="user-logout" onClick={handleLogout}>
          <FontAwesomeIcon icon={faRightFromBracket} />
          {isOpen && <span>Logout</span>}
        </button>
      </aside>

      <div className="user-right">
        <div className="user-navbar">
          <div className="user-topbar-left">
            <button className="user-toggle" onClick={() => setIsOpen((prev) => !prev)}>
              <FontAwesomeIcon icon={isOpen ? faAnglesLeft : faAnglesRight} />
            </button>
            <h2 className="dashboard-title">Dashboard</h2>
          </div>

          <div className="profile-icon" onClick={() => navigate("/user")}>
            {imgSrc(user?.profile_pic) ? (
              <img
                src={imgSrc(user.profile_pic)}
                alt="profile"
                className="profile-img"
              />
            ) : (
              <div className="profile-avatar-fallback">
                <FontAwesomeIcon icon={faUserSecret} />
              </div>
            )}
          </div>
        </div>

        <main className="user-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};