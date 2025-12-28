// CRUD functions + render card creation + validation helpers.
// The main app logic is in app.js
// CRUD: add, update, delete, toggle favorite
// CRUD: add
function addContact(data) {
  const list = getContacts();
  list.push({
    id: uid(),
    ...data,
    favorite: false,
    createdAt: new Date().toISOString(),
  });

  saveContacts(list);
  renderContacts(); // re-draw UI
  showToast(`"${data.name}" Added Successfully`);
}

// CRUD: update
function updateContact(id, data) {
  const updated = getContacts().map((c) =>
    c.id === id ? { ...c, ...data } : c
  );
  saveContacts(updated);
  renderContacts();
  showToast(`"${data.name}" Updated Successfully`);
}

// CRUD: delete
function deleteContact(id) {
  // Remove details overlay if open
  const details = document.getElementById("detailsPage");
  if (details) details.remove();

  saveContacts(getContacts().filter((c) => c.id !== id));
  renderContacts();
  showToast("User Deleted Successfully");
}

// CRUD: toggle favorite
function toggleFavorite(id) {
  const updated = getContacts().map((c) =>
    c.id === id ? { ...c, favorite: !c.favorite } : c
  );
  saveContacts(updated);

  const contact = updated.find((c) => c.id === id);

  // Show professional toast
  const action = contact.favorite ? "added to" : "removed from";
  showToast(`"${contact.name}" ${action} favorites`);

  renderContacts();
}

// Build a DOM card for a single contact
const contactsSection = document.getElementById("contactsSection");

function createCard(contact) {
  const el = document.createElement("article");
  el.className = "card";

  const initials =
    (contact.name || "")
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "--";

  el.innerHTML = `
    <div class="avatar">${initials}</div>
    <div class="card-body">
      <div class="name-row">
        <h3>${contact.name}</h3>
        <button class="icon-btn fav-btn">
          ${
            contact.favorite
              ? '<i class="fas fa-star" style="color:#ffb36b"></i>'
              : '<i class="far fa-star"></i>'
          }
        </button>
      </div>

      <div class="meta">
        <span><i class="fas fa-phone"></i> ${contact.phone}</span>
        <span><i class="fas fa-envelope"></i> ${contact.email}</span>
        <span><i class="fas fa-globe"></i> ${contact.country}</span>
      </div>
    </div>
  `;

  // Only one action on home → Open details page
  el.onclick = () => openDetailsPage(contact);

  el.querySelector(".fav-btn").onclick = (e) => {
    e.stopPropagation(); // prevent opening details
    toggleFavorite(contact.id);
  };

  return el;
}

//for showing this contact in another page
function openDetailsPage(contact) {
  const html = `
    <div class="details-overlay" id="detailsPage">
      <div class="details-panel">
        
        <button id="closeDetails" class="close-btn">✕</button>

        <h2> ${contact.name}</h2>

        <p><i class=""> Phone :</i> ${contact.phone}</p>
        <p><i class="">Email : </i> ${contact.email}</p>
        <p><i class="">Country : </i> ${contact.country}</p>
        <p><i class="">Group : </i> ${contact.group}</p>
        <p><i class="">Notes : </i> ${contact.notes}</p>

        <div class="details-actions">

          <button class="btn edit-btn" onclick="handleEdit('${contact.id}')">
            <i class="fas fa-pen"></i> Edit
          </button>

          <button class="btn delete-btn" onclick="if(confirm('Are You Sure You Want To Delete?')) deleteContact('${contact.id}')">
            <i class="fas fa-trash"></i> Delete
          </button>

            <a href="tel:${contact.phone}" class="btn call-btn">
              <i class="fas fa-phone"></i> Call
            </a>

          <a href="mailto:${contact.email}" class="btn email-btn">
            <i class="fas fa-envelope"></i> Email
          </a>

          <button class="btn share-btn" onclick="shareContact('${contact.id}')">
            <i class="fas fa-share"></i> Share
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);

  /**
   * Close the details page overlay when the close button is clicked.
   * Removes the #detailsPage element from the DOM.
   */
  document.getElementById("closeDetails").onclick = () => {
    document.getElementById("detailsPage").remove();
  };

  const overlay = document.getElementById("detailsPage");
  document.getElementById("closeDetails").onclick = () => overlay.remove();

  // Close if click outside panel
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
}

// Edit contact
function editContact(id) {
  const contact = getContacts().find((c) => c.id === id);
  if (!contact) return;

  openModal("edit", contact);
}

// For managing the pop up model to close when edit is click
function handleEdit(id) {
  // Close the details page first
  const details = document.getElementById("detailsPage");
  if (details) details.remove();

  // Now open the edit modal
  editContact(id);
}

function shareContact(id) {
  const c = getContacts().find((x) => x.id === id);
  const text = `${c.name}\n${c.phone}\n${c.email}`;

  if (navigator.share) {
    navigator.share({ title: c.name, text });
  } else {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  }
}

// --------------------
// Validation helpers
// --------------------

// Country-based phone regex checks
function validatePhoneByCountry(country, phone) {
  phone = phone.replace(/\s+/g, "");
  const patterns = {
    usa: /^(?:\+1)?[2-9]\d{2}[2-9]\d{6}$/,
    canada: /^(?:\+1)?[2-9]\d{2}[2-9]\d{6}$/,
    uk: /^(?:\+44|0)7\d{9}$/,
    nepal: /^(?:\+977)?9[678]\d{8}$/,
    japan: /^(?:\+81|0)[6789]0\d{8}$/,
  };
  return patterns[country]?.test(phone);
}
// Check if a phone number is valid for the selected country
function validatePhone(phone) {
  const country = document.getElementById("countrySelect").value;
  return validatePhoneByCountry(country, phone);
}

// renderContacts initial simple version (will be enhanced/overridden by pagination.js)
function renderContacts() {
  let list = getContacts();

  if (currentTab === "favorites") list = list.filter((c) => c.favorite);

  const group = document.getElementById("filterGroup").value;
  if (group) list = list.filter((c) => c.group === group);

  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.phone || "").includes(q) ||
        (c.email || "").toLowerCase().includes(q)
    );
  }

  const sort = document.getElementById("sortSelect").value;
  if (sort === "name-asc")
    list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  else if (sort === "name-desc")
    list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
  else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  contactsSection.innerHTML = "";
  if (!list.length) {
    contactsSection.innerHTML =
      '<div class="empty"><i class="fas fa-address-book"></i><p>No contacts</p></div>';
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "contact-list";
  list.forEach((c) => wrapper.appendChild(createCard(c)));
  contactsSection.appendChild(wrapper);
}

// --------------------
// Form submit handling (validation + add/update)
// --------------------
// Hook up the form submit - this relies on contactForm from modal.js
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("contactId").value.trim();
  const data = {
    name: document.getElementById("fullName").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim().toLowerCase(),
    group: document.getElementById("groupSelect").value,
    notes: document.getElementById("notes").value.trim(),
    country: document.getElementById("countrySelect").value,
  };

  // Basic required checks
  if (!data.name || !data.phone || !data.email)
    return showToast("Please fill required fields");

  // Basic phone format check
  if (!/^\+?[0-9\s\-()]{7,20}$/.test(data.phone))
    return showToast("Invalid phone format");

  // Country-specific validation
  if (!validatePhoneByCountry(data.country, data.phone))
    return showToast("Phone does not match country's rules");

  // Email check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return showToast("Invalid email");

  // Duplicate detection
  const dup = getContacts().find(
    (c) => (c.phone === data.phone || c.email === data.email) && c.id !== id
  );
  if (dup) return showToast("Contact already exists");

  // Add or update
  id ? updateContact(id, data) : addContact(data);
  closeModal();
});
