import { useState, useRef, useEffect } from "react";
import logo from "../../assets/logo.jpeg";
import "./authpage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import {  login, register } from "../../services/auth.service";
import { useNavigate } from "react-router";
import { Spinner } from "../../components/spinner/spinner";
import { toast } from "react-toastify";

export const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmRef = useRef(null);
    const organizationRef = useRef(null);

    useEffect(() => {
        if (!isLogin) {
            nameRef.current?.focus();
        } else {
            emailRef.current?.focus();
        }
    }, [isLogin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const username = nameRef.current?.value.trim();
        const email = emailRef.current?.value.trim();
        const password = passwordRef.current?.value;
        const confirm = confirmRef.current?.value;
        const organization = organizationRef.current?.value;

        if (!isLogin && !username) {
            setError("Full name is required");
            nameRef.current?.focus();
            return;
        }
        if (!email) {
            setError("Email is required");
            emailRef.current?.focus();
            return;
        }
        if (!password) {
            setError("Password is required");
            passwordRef.current?.focus();
            return;
        }
        if (!isLogin && password !== confirm) {
            setError("Passwords do not match");
            confirmRef.current?.focus();
            return;
        }


        setLoading(true);
        if (isLogin) {

            try {


                const response = await login({ email, password });

                if (response.success) {
                    toast.success("Successfully Loggedin")
                    navigate("/")

                } else {
                    setError(response.message || "Something went wrong. Please try again.");
                }
            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        }
        else {
            try {
                const response = await register({ username, email, password, organization })

                if (response.success) {
                    toast.success("Successfully Registered.Please Login to continue")
                    setIsLogin(true)

                } else {
                    setError(response.message || "Something went wrong. Please try again.");
                }
            }
            catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleGoogleSignIn=async()=>{

        try {
            window.location.href = "http://localhost:8080/auth/google";
        }
        catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
        
    }


    return (
        
            <div className="auth-box">
                <div className="auth-left">
                    <img src={logo} alt="logo" className="auth-logo-small" />

                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${isLogin ? "auth-tab--active" : ""}`}
                            onClick={() => setIsLogin(true)}
                        >
                            Sign in
                        </button>
                        <button
                            className={`auth-tab ${!isLogin ? "auth-tab--active" : ""}`}
                            onClick={() => setIsLogin(false)}
                        >
                            Sign up
                        </button>
                    </div>

                    <p className="auth-subtitle">
                        {isLogin
                            ? "Welcome back! Please enter your details."
                            : "Create your account to get started."}
                    </p>

                    <button className="auth-google" onClick={handleGoogleSignIn}>
                        <FontAwesomeIcon icon={faGoogle} />
                        Continue with Google
                    </button>

                    <div className="auth-divider"><span>or</span></div>

                    {error && (
                        <p className="auth-error">{error}</p>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="auth-field">
                                <label>Full name</label>
                                <input
                                    ref={nameRef}
                                    type="text"
                                    name="name"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}

                        <div className="auth-field">
                            <label>Email</label>
                            <input
                                ref={emailRef}
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                            />
                        </div>
                        {!isLogin && (
                            <div className="auth-field">
                                <label>Organization</label>
                                <input
                                    ref={organizationRef}
                                    type="text"
                                    name="organization"
                                    placeholder="Organization Name"
                                />
                            </div>
                        )}

                        <div className="auth-field">
                            <label>Password</label>
                            <input
                                ref={passwordRef}
                                type="password"
                                name="password"
                                placeholder="••••••••"
                            />
                        </div>

                        {!isLogin && (
                            <div className="auth-field">
                                <label>Confirm password</label>
                                <input
                                    ref={confirmRef}
                                    type="password"
                                    name="confirm"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        {isLogin && (
                            <div className="auth-forgot">
                                <a href="/auth/forget-password">Forgot password?</a>
                            </div>
                        )}
                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? <Spinner size={18} color="#ffffff"
                            
                        /> : isLogin ? "Sign in" : "Create account"}
                        </button>
                    </form>

                    <p className="auth-switch">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => setIsLogin(!isLogin)} disabled={loading}>
                            {isLogin ? " Sign up" : " Sign in"}
                        </button>
                    </p>
                </div>

                <div className="auth-right">
                    <div className="auth-right-content">
                        <img src={logo} alt="logo" className="auth-logo-large" />
                        <h2>Everything your school needs, in one place.</h2>
                        <p>Uniforms, stationery, books and more — delivered to your door.</p>
                    </div>
                </div>
            </div>
     
    );
};