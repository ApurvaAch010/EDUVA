import { Outlet, NavLink, useNavigate } from "react-router-dom";
import "./AdminLayout.css";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesLeft,
  faAnglesRight,
  faGauge,
  faBox,
  faTag,
  faShoppingBag,
  faImage,
  faUsers,
  faRightFromBracket,
  faUserSecret,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import logo from "../assets/logo.jpeg";
import { useDispatch } from "react-redux";
import { clearUser } from "../store/authSlice";
import { logoutApi } from "../services/auth.service";

export const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!loading && (!isAuthenticated || user.role !== "admin")) return null;

  const handleLogout = async () => {
    await logoutApi();
    dispatch(clearUser());
    navigate("/auth");
  };

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: faGauge, end: true },
    { to: "/admin/products", label: "Products", icon: faBox },
    { to: "/admin/categories", label: "Categories", icon: faTag },
    { to: "/admin/orders", label: "Orders", icon: faShoppingBag },
    { to: "/admin/banners", label: "Banners", icon: faImage },
    { to: "/admin/users", label: "Users", icon: faUsers },
  ];

  return (
    <div className="admin-wrapper">
      <aside className={`admin-sidebar ${isOpen ? "admin-sidebar--open" : "admin-sidebar--closed"}`}>

        <div className="admin-sidebar-logo" onClick={()=>{navigate("/")}}
        style={{cursor:"pointer"}}>
          <img src={logo} alt="logo" className="admin-logo-img" />
          {isOpen && <span className="admin-logo-text">Eduva</span>}  
        </div>

      
        <div className="admin-menu">
          {isOpen && <p className="admin-menu-label">Main Menu</p>}

          <ul className="admin-nav">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`
                  }
                >
                  <FontAwesomeIcon icon={item.icon} className="admin-nav-icon" />
                  {isOpen && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

       
        <button className="admin-logout" onClick={handleLogout}>
          <FontAwesomeIcon icon={faRightFromBracket} />
          {isOpen && <span>Logout</span>}
        </button>
      </aside>

     
      <div className="admin-right">

           <div className="admin-navbar">
          <div className="admin-topbar-left">
            <button className="admin-toggle" onClick={() => setIsOpen(prev => !prev)}>
              <FontAwesomeIcon icon={isOpen ? faAnglesLeft : faAnglesRight} />
            </button>
            <h2 className="dashboard-title">Dashboard</h2>
          </div>

          <div
            className="profile-icon"
            onClick={() => navigate("/profile")}
          >
            {user?.profile_pic ? (
              <img
                src={`${import.meta.env.VITE_API_URL}/${user.profile_pic}`}
                alt="profile"
                className="profile-img"
              />
            ) : (
              <div className="profile-avatar-fallback">
                {<FontAwesomeIcon icon={faUserSecret}/>}
              </div>
            )}
            
          </div>
        </div>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};