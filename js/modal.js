// Handles opening/closing the Add/Edit modal and pre-filling form fields.

// Grab modal elements once (these exist in index.html)
const modal = document.getElementById("contactModal");
const modalClose = document.getElementById("modalClose");
const cancelBtn = document.getElementById("cancelBtn");
const contactForm = document.getElementById("contactForm");

// Open the add/edit modal.
// mode: "add" or "edit". contact: optional object to pre-fill form.
function openModal(mode = "add", contact = null) {
  modal.classList.add("open");

  // Set title depending on mode
  document.getElementById("modalTitle").textContent =
    mode === "add" ? "Add Contact" : "Edit Contact";

  // Small UI nicety — button label
  document.getElementById("saveBtn").textContent = "Save";

  // If editing, pre-populate fields; otherwise clear them
  document.getElementById("contactId").value = contact?.id || "";
  document.getElementById("fullName").value = contact?.name || "";
  document.getElementById("phone").value = contact?.phone || "";
  document.getElementById("email").value = contact?.email || "";
  document.getElementById("groupSelect").value = contact?.group || "";
  document.getElementById("notes").value = contact?.notes || "";
  document.getElementById("countrySelect").value = contact?.country || "";

  // Focus the name field after a short delay so keyboard / animation is smooth
  setTimeout(() => document.getElementById("fullName").focus(), 250);
}

// Close modal and reset the form fields
function closeModal() {
  modal.classList.remove("open");
  contactForm.reset();
}

// Wire up close buttons / back-drop click
modalClose.onclick = closeModal;
cancelBtn.onclick = closeModal;
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
