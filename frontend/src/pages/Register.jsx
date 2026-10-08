import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import FormField from "../Components/FormField";
import InlineAlert from "../Components/InlineAlert";
import { useAuth } from "../hooks/useAuth";
import {
  hasErrors,
  validateEmail,
  validateName,
  validateOptionalPhone,
  validatePassword
} from "../utils/validators";

function Register() {
  const { register, isAuthenticated } = useAuth();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
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
      name: validateName(values.name),
      email: validateEmail(values.email),
      phone: validateOptionalPhone(values.phone),
      password: validatePassword(values.password),
      confirmPassword: values.confirmPassword === values.password ? "" : "Passwords do not match"
    };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password
      });
    } catch (error) {
      setSubmitError(error.message);
      setErrors(error.fieldErrors || {});
      setSubmitting(false);
    }
  };

  return (
    <main className="bms-auth-page">
      <form className="bms-auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Create account</h1>
        <p className="bms-auth-subtitle">One account keeps your tickets and holds your seats safely.</p>

        <InlineAlert message={submitError} onDismiss={() => setSubmitError("")} />

        <FormField
          id="register-name"
          name="name"
          label="Full name"
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
        <FormField
          id="register-email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <FormField
          id="register-phone"
          name="phone"
          type="tel"
          label="Mobile number (optional)"
          autoComplete="tel"
          value={values.phone}
          onChange={handleChange}
          error={errors.phone}
        />
        <FormField
          id="register-password"
          name="password"
          type="password"
          label="Password (8 or more characters)"
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <FormField
          id="register-confirm"
          name="confirmPassword"
          type="password"
          label="Confirm password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <button type="submit" className="bms-btn-primary bms-auth-submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>

        <p className="bms-auth-switch">
          Already registered? <Link to="/login" state={location.state}>Sign in</Link>
        </p>
      </form>
    </main>
  );
}

export default Register;
