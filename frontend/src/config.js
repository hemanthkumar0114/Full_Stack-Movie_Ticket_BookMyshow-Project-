const configuredBaseUrl = import.meta.env.VITE_API_URL;
const developmentDefault = import.meta.env.DEV ? "http://localhost:8080/api/v1" : "";

export const API_BASE_URL = (configuredBaseUrl || developmentDefault).replace(/\/+$/, "");

if (!API_BASE_URL) {
  console.error("VITE_API_URL is not set. Add it to your hosting environment variables and redeploy.");
}
