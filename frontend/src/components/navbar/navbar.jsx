import "./navbar.css"
import logo from "../../assets/logo.jpeg"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faBarsStaggered, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <nav>
            <div className="logo">
                <img src={logo} alt="logo" />
            </div>
            <div className="hamburger" onClick={() => { setIsOpen(prev => !prev) }}>
                <FontAwesomeIcon icon={faBarsStaggered} />
            </div>


            <div className={`navigation-links ${isOpen ? "active" : ""}`}>
                <FontAwesomeIcon icon={faXmark} className="close-icon" onClick={() => { setIsOpen(prev => !prev) }} />
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
                <button className="btn btn-login">Login</button>
                <button className="btn btn-register">Register</button>
            </div>
        </nav>
    );
}