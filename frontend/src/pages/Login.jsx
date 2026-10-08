import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import FormField from "../Components/FormField";
import InlineAlert from "../Components/InlineAlert";
import { useAuth } from "../hooks/useAuth";
import { hasErrors, validateEmail } from "../utils/validators";

function Login() {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {
      email: validateEmail(values.email),
      password: values.password ? "" : "Password is required"
    };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      await login({ email: values.email.trim(), password: values.password });
    } catch (error) {
      setSubmitError(error.message);
      setErrors(error.fieldErrors || {});
      setSubmitting(false);
    }
  };

  return (
    <main className="bms-auth-page">
      <form className="bms-auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Sign in</h1>
        <p className="bms-auth-subtitle">Sign in to book seats and see your tickets.</p>

        <InlineAlert message={submitError} onDismiss={() => setSubmitError("")} />

        <FormField
          id="login-email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <FormField
          id="login-password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        <button type="submit" className="bms-btn-primary bms-auth-submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="bms-auth-switch">
          New here? <Link to="/register" state={location.state}>Create an account</Link>
        </p>
      </form>
    </main>
  );
}

export default Login;
