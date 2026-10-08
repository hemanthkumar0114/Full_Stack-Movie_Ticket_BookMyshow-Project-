const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\- ]{10,15}$/;

export function validateName(value) {
  const name = value.trim();
  if (!name) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  if (name.length > 100) return "Name must be 100 characters or fewer";
  return "";
}

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return "Email is required";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address";
  return "";
}

export function validatePassword(value) {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters";
  if (value.length > 72) return "Password must be 72 characters or fewer";
  return "";
}

export function validateOptionalPhone(value) {
  const phone = value.trim();
  if (!phone) return "";
  if (!PHONE_PATTERN.test(phone)) return "Enter 10 to 15 digits";
  return "";
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}
