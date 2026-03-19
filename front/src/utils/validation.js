export function isBlank(value) {
  return value == null || String(value).trim() === "";
}

export function normalizePhone(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  // handle common India prefixes like +91 / 91
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function isValidEmail(email) {
  const v = String(email ?? "").trim();
  return /^\S+@\S+\.\S+$/.test(v);
}

export function isAlphaSpace(value) {
  const v = String(value ?? "").trim();
  // letters + spaces only (unicode letters)
  return /^[\p{L} ]+$/u.test(v);
}

export function isDigitsOnly(value) {
  const v = String(value ?? "").trim();
  return /^\d+$/.test(v);
}

export function isValidPhone(phone) {
  const raw = String(phone ?? "").trim();
  if (isBlank(raw)) return false;
  // strict: digits only (no +, spaces, hyphens, etc.)
  if (!isDigitsOnly(raw)) return false;
  const digits = normalizePhone(raw);
  return /^\d{10}$/.test(digits);
}

export function validateContact(contact) {
  const v = String(contact ?? "").trim();
  if (isBlank(v)) return { ok: false, message: "Email or phone is required" };

  if (v.includes("@")) {
    return isValidEmail(v)
      ? { ok: true, type: "email", value: v }
      : { ok: false, message: "Please enter a valid email address" };
  }

  return isValidPhone(v)
    ? { ok: true, type: "phone", value: normalizePhone(v) }
    : {
        ok: false,
        message:
          "Phone must be 10 digits only (no letters or special characters)",
      };
}

export const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(password) {
  const pw = String(password ?? "");
  if (isBlank(pw)) return "Password is required";
  if (pw.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  if (!/[a-z]/.test(pw)) return "Password must contain at least 1 lowercase letter";
  if (!/[A-Z]/.test(pw)) return "Password must contain at least 1 uppercase letter";
  if (!/\d/.test(pw)) return "Password must contain at least 1 number";
  return "";
}

export function validateRequiredText(label, value, { min = 1 } = {}) {
  const v = String(value ?? "").trim();
  if (v.length === 0) return `${label} is required`;
  if (v.length < min) return `${label} must be at least ${min} characters`;
  return "";
}

export function validateRequiredAlphaText(label, value, { min = 1 } = {}) {
  const base = validateRequiredText(label, value, { min });
  if (base) return base;
  if (!isAlphaSpace(value)) return `${label} must contain letters only`;
  return "";
}

export function validateRequiredDigits(label, value, { length } = {}) {
  const v = String(value ?? "").trim();
  if (v.length === 0) return `${label} is required`;
  if (!isDigitsOnly(v)) return `${label} must contain digits only`;
  if (typeof length === "number" && v.length !== length) {
    return `${label} must be exactly ${length} digits`;
  }
  return "";
}
