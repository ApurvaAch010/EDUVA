import { Link } from "react-router-dom";
import logo from "../../assets/logo.jpeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faTiktok, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import "./footer.css";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* brand */}
        <div className="footer-brand">
          <img src={logo} alt="logo" className="footer-logo" />
          <p>Your one-stop shop for all school supplies — uniforms, stationery, books and more.</p>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faTiktok} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
          </div>
        </div>

        {/* quick links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/orders">My Orders</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Categories</h4>
          <ul>
            <li><Link to="/products?category=uniforms">Uniforms</Link></li>
            <li><Link to="/products?category=stationery">Stationery</Link></li>
            <li><Link to="/products?category=books">Books</Link></li>
            <li><Link to="/products?category=sports">Sports</Link></li>
            <li><Link to="/products?category=art">Art Supplies</Link></li>
          </ul>
        </div>


        <div className="footer-contact">
          <h4>Contact Us</h4>
          <ul>
            <li>
              <FontAwesomeIcon icon={faLocationDot} />
              <span>Kathmandu, Nepal</span>
            </li>
            <li>
              <FontAwesomeIcon icon={faPhone} />
              <span>+977 9800000000</span>
            </li>
            <li>
              <FontAwesomeIcon icon={faEnvelope} />
              <span>support@eduva.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* bottom bar */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Eduva. All rights reserved.</p>
      </div>
    </footer>
  );
};