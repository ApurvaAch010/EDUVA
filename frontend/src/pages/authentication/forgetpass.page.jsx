import "./forgetpass.page.css";
import { useRef, useState } from "react";
import { forgetPasswordApi, resetPasswordApi } from "../../services/auth.service";
import { Spinner } from "../../components/spinner/spinner";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

export const ForgetPass = () => {
  const [step, setStep] = useState("email"); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate();

 
  const emailRef = useRef(null);


  const otpRef      = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef  = useRef(null);
  

  const handleForgetPass = async () => {
    setError("");
    const email = emailRef.current?.value.trim();

    if (!email) {
      setError("Please enter your email");
      emailRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const res = await forgetPasswordApi({email});
      if (res.success) {
        setStep("reset"); 
        setTimeout(() => otpRef.current?.focus(), 100);
      } else {
        setError(res.message || "Something went wrong");
      }
    } catch (err) {
      setError(err.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPass = async () => {
    setError("");
    const email    = emailRef.current?.value.trim(); 
    const otp      = otpRef.current?.value.trim();
    const password = passwordRef.current?.value;
    const confirmPassword  = confirmRef.current?.value;

    if (!otp) {
      setError("Please enter the OTP");
      otpRef.current?.focus();
      return;
    }
    if (!password) {
      setError("Please enter a new password");
      passwordRef.current?.focus();
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      confirmRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordApi({ email, otp, password,confirmPassword });
      if (res.success) {
        toast.success("Password reset successfully")
       navigate('/auth')
      } else {
        setError(res.message || "Something went wrong");
      }
    } catch (err) {
      setError(err.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forget-pass-page">
      <div className="forget-pass-box">
        <h2 className="fp-h2">
          {step === "email" ? "Forgot Password" : "Reset Password"}
        </h2>
        <p className="fp-subtitle">
          {step === "email"
            ? "Enter your email and we'll send you an OTP."
            : "Enter the OTP sent to your email and set a new password."}
        </p>

        {error && <p className="fp-error">{error}</p>}

        
        <div className="field">
          <label>Email</label>
          <input
            ref={emailRef}
            type="email"
            placeholder="you@example.com"
            disabled={step === "reset"}
            className={step === "reset" ? "input--disabled" : ""}
          />
        </div>

        {step === "email" && (
          <button
            className="submit-btn"
            onClick={handleForgetPass}
            disabled={loading}
          >
            {loading ? <Spinner  size={18} color="#ffffff"/> : "Send OTP"}
          </button>
        )}

        {step === "reset" && (
          <>
            <div className="field">
              <label>OTP</label>
              <input
                ref={otpRef}
                type="text"
                placeholder="Enter OTP"
                maxLength={6}
              />
            </div>

            <div className="field">
              <label>New Password</label>
              <input
                ref={passwordRef}
                type="password"
                placeholder="••••••••"
              />
            </div>

            <div className="field">
              <label>Confirm Password</label>
              <input
                ref={confirmRef}
                type="password"
                placeholder="••••••••"
              />
            </div>

            <button
              className="submit-btn"
              onClick={handleResetPass}
              disabled={loading}
            >
              {loading ? <Spinner size={18} color="#ffffff"/> : "Reset Password"}
            </button>

            <button
              className="fp-back"
              onClick={() => { setStep("email"); setError(""); }}
            >
            <FontAwesomeIcon icon={faChevronLeft} />Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};