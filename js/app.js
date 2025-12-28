// This is the main app logic.
// Wiring: event listeners, import/export, initialization bootstrapping.
// Tabs: switch active tab and re-render
document.querySelectorAll(".tab-compact").forEach((btn) =>
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-compact")
      .forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");
    currentTab = btn.dataset.tab;
    renderContacts();
  })
);

// Open modal for adding contact
document.getElementById("addContactBtn").onclick = () => openModal("add");

// Basic UI events to trigger re-render
document.getElementById("searchInput").oninput = renderContacts;
document.getElementById("sortSelect").onchange = renderContacts;
document.getElementById("filterGroup").onchange = renderContacts;

// Page-size select change: update contactsPerPage and reset to page 1
document.getElementById("pageSizeSelect").onchange = function () {
  contactsPerPage = parseInt(this.value);
  currentPage = 1;
  renderContacts();
};

// Close modal with ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// --------------------
// Import / Export
// --------------------

const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

// Export contacts as a JSON file
exportBtn.addEventListener("click", () => {
  const data = getContacts();
  if (!data.length) return showToast("No contacts to export");

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `contacts_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  showToast("Contacts exported");
});

// Trigger file picker when import button clicked
importBtn.addEventListener("click", () => importFile.click());

// Handle import file selection
importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (!Array.isArray(imported)) throw new Error("Wrong format");

      const existing = getContacts();
      const merged = [...existing];

      // Merge while avoiding duplicates by id/email/phone
      imported.forEach((c) => {
        const exists = existing.some(
          (ex) => ex.id === c.id || ex.email === c.email || ex.phone === c.phone
        );
        if (!exists)
          merged.push({
            id: c.id || uid(),
            name: c.name || "",
            phone: c.phone || "",
            email: (c.email || "").toLowerCase(),
            group: c.group || "",
            notes: c.notes || "",
            favorite: !!c.favorite,
            createdAt: c.createdAt || new Date().toISOString(),
          });
      });

      saveContacts(merged);
      renderContacts();
      showToast("Contacts imported");
    } catch {
      showToast("Import failed: invalid file");
    } finally {
      importFile.value = "";
    }
  };

  reader.readAsText(file);
});

// --------------------
// Initialization
// --------------------
// Create an init function that attempts to seed data from dummyContact.json,
// otherwise seeds two sample contacts when localStorage is empty.
function init() {
  fetch("./dummyContact.json")
    .then((res) => {
      if (!res.ok) throw new Error("File missing");
      return res.json();
    })
    .then((data) => {
      if (!localStorage.getItem(STORAGE_KEY)) saveContacts(data);
      renderContacts();
    })
    .catch(() => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const sample = [
          {
            id: "b1a6f8c2-3f4d-4a9b-9e72-1c2d3e4f5a67",
            name: "Aryan",
            phone: "07350 191725",
            email: "aryan@example.com",
            group: "Friends",
            notes: "Met at college. Prefers evening calls.",
            favorite: true,
            createdAt: "2025-10-21T08:30:00.000Z",
            country: "uk",
          },
          {
            id: "c2d7e9f3-5b6a-4d2e-8f11-2b3c4d5e6f78",
            name: "Raj",
            phone: "07911 123456",
            email: "raj@example.com",
            group: "Work",
            notes: "Frontend developer on the Phoenix project.",
            favorite: false,
            createdAt: "2025-10-21T09:15:00.000Z",
            country: "uk",
          },
        ];
        saveContacts(sample);
      }
      renderContacts();
    });
}

// Run initialization
init();
