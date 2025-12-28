// Small helper module: storage, ID generation and toast notifications.
// Key used in localStorage
const STORAGE_KEY = "contacts_list";

// UI state
let toastTimer = null;
let currentTab = "all"; // which tab is active: "all" or "favorites"

// Generate a short unique-ish id (good enough for client-side data)
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Load contacts array from localStorage, or return empty array
const getContacts = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

// Save contacts array back to localStorage
const saveContacts = (list) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

// Show a transient toast message at bottom of screen
function showToast(msg, time = 2200) {
  clearTimeout(toastTimer);
  const toast = document.getElementById("toast");
  if (!toast) return; // guard if UI not ready
  toast.textContent = msg;
  toast.style.display = "block";
  toastTimer = setTimeout(() => (toast.style.display = "none"), time);
}
