// This file intentionally overrides renderContacts (wraps the original).

// Current page and contacts per page
let currentPage = 1;
let contactsPerPage =
  parseInt(document.getElementById("pageSizeSelect")?.value) || 4;

// Save the full filtered/sorted list for pagination navigation
let filteredAndSortedList = [];

const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");

// Save the original renderContacts (from contacts.js) so we can reuse filtering/sorting logic
const originalRenderContacts = renderContacts;

// Update pagination buttons and info text
function updatePaginationControls(totalContacts) {
  const totalPages = Math.ceil(totalContacts / contactsPerPage) || 1;

  if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
  if (currentPage === 0 && totalPages > 0) currentPage = 1;

  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;

  pageInfo.textContent =
    totalContacts === 0
      ? "No contacts"
      : `Page ${currentPage} of ${totalPages} (${totalContacts} total)`;
}

// Move pages by delta (-1 or +1)
function changePage(delta) {
  const totalPages = Math.ceil(filteredAndSortedList.length / contactsPerPage);
  const newPage = currentPage + delta;
  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
    renderContacts();
  }
}

prevPageBtn.onclick = () => changePage(-1);
nextPageBtn.onclick = () => changePage(1);

// Override renderContacts: run original filtering/sorting, then paginate the results
renderContacts = function () {
  // Re-run the filtering/sorting logic by calling the original function but capturing its results.
  // Since originalRenderContacts writes directly to the DOM, we replicate the filtering/sorting part here
  // to get the full list; this avoids duplicating UI build logic from createCard.
  let list = getContacts();

  if (currentTab === "favorites") list = list.filter((c) => c.favorite);
  const g = document.getElementById("filterGroup").value;
  if (g) list = list.filter((c) => c.group === g);

  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  if (q)
    list = list.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.phone || "").includes(q) ||
        (c.email || "").toLowerCase().includes(q)
    );

  const sort = document.getElementById("sortSelect").value;
  if (sort === "name-asc")
    list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  else if (sort === "name-desc")
    list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
  else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Save the full filtered/sorted list for pagination navigation
  filteredAndSortedList = list;

  // Pagination UI update
  const totalContacts = list.length;
  updatePaginationControls(totalContacts);

  contactsSection.innerHTML = "";
  if (!totalContacts) {
    contactsSection.innerHTML =
      '<div class="empty"><i class="fas fa-address-book"></i><p>No contacts</p></div>';
    return;
  }

  // Calculate slice for current page
  const startIndex = (currentPage - 1) * contactsPerPage;
  const endIndex = startIndex + contactsPerPage;
  const contactsForPage = list.slice(startIndex, endIndex);

  const wrapper = document.createElement("div");
  wrapper.className = "contact-list";
  contactsForPage.forEach((c) => wrapper.appendChild(createCard(c)));
  contactsSection.appendChild(wrapper);
};

// Reset currentPage to 1 on init — wrap existing init if present
const originalInit = (function () {
  // if init exists, preserve it; else keep a noop
  return typeof init === "function" ? init : function () {};
})();

init = function () {
  currentPage = 1;
  originalInit();
};
