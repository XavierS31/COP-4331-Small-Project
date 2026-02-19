// Uses urlBase, extension, userId from sign.js / code.js

// Contact Validation 
function isValidEmail(email) {
	if (!email || email.trim() === "") return true;
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email.trim());
}

function isValidPhone(phone) {
	if (!phone || phone.trim() === "") return true;
	return /^\d{3}-\d{3}-\d{4}$/.test(phone.trim());
}

function validateContactForm(msgEl) {
	let phone = document.getElementById("contactPhone").value.trim();
	let email = document.getElementById("contactEmail").value.trim();
	let errors = [];
	if (phone && !isValidPhone(phone)) {
		errors.push("* Invalid phone number. Format must be 000-000-0000");
	}
	if (email && !isValidEmail(email)) {
		errors.push("* Invalid email format.");
	}
	if (errors.length > 0 && msgEl) {
		msgEl.innerHTML = errors.join("<br>");
		return false;
	}
	return true;
}

// Contact CRUD 
function addContact() {
	let firstName = document.getElementById("contactFirstName").value.trim();
	let lastName = document.getElementById("contactLastName").value.trim();
	let phone = document.getElementById("contactPhone").value.trim();
	let email = document.getElementById("contactEmail").value.trim();

	let msgEl = document.getElementById("contactFormResult");
	if (msgEl) msgEl.innerHTML = "";

	if (!firstName || !lastName) {
		if (msgEl) msgEl.innerHTML = "First and last name are required.";
		return;
	}

	if (!validateContactForm(msgEl)) return;

	let tmp = { firstName, lastName, phone, email, userId };
	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + '/AddContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	xhr.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			let jsonObject = JSON.parse(xhr.responseText);
			if (jsonObject.error && jsonObject.error.length > 0) {
				if (msgEl) msgEl.innerHTML = jsonObject.error;
				return;
			}
			closeContactModal();
			searchContacts();
			triggerContactAnimation("add");
		}
	};
	xhr.send(jsonPayload);
}

// Function to edit a contact
function editContact(contactId) {
	let firstName = document.getElementById("contactFirstName").value.trim();
	let lastName = document.getElementById("contactLastName").value.trim();
	let phone = document.getElementById("contactPhone").value.trim();
	let email = document.getElementById("contactEmail").value.trim();

	let msgEl = document.getElementById("contactFormResult");
	if (msgEl) msgEl.innerHTML = "";

	if (!firstName || !lastName) {
		if (msgEl) msgEl.innerHTML = "First and last name are required.";
		return;
	}

	if (!validateContactForm(msgEl)) return;

	let tmp = { firstName, lastName, phoneNumber: phone, email, contactId: parseInt(contactId, 10) };
	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + '/UpdateContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	xhr.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			closeContactModal();
			searchContacts();
			triggerContactAnimation("edit", contactId);
		}
	};
	xhr.send(jsonPayload);
}

// Function to delete a contact
function deleteContact(contactId) {
	if (!confirm("Delete this contact?")) return;

	let tmp = { id: parseInt(contactId, 10), userId };
	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + '/DeleteContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	xhr.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			let jsonObject = JSON.parse(xhr.responseText);
			if (jsonObject.error && jsonObject.error.length > 0) return;
			triggerContactAnimation("delete", contactId, function () {
				searchContacts();
			});
		}
	};
	xhr.send(jsonPayload);
}

// Function to search for contacts - uses GetContacts.php API endpoint
// Loads contacts for the logged-in user; filters by search term (name, email, phone) when typing
function searchContacts() {
	let input = document.getElementById("contactsSearchInput");
	if (!input) return;
	let search = input.value.trim();

	let uid = (typeof userId !== "undefined" && userId > 0) ? userId : 0;
	if (uid <= 0) {
		renderContactsTable([]);
		return;
	}
	let tmp = { search: search, userId: uid };
	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + "/GetContacts." + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	xhr.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			let jsonObject = JSON.parse(xhr.responseText);
			if (jsonObject.error && jsonObject.error.length > 0) return;
			renderContactsTable(jsonObject.results || []);
			triggerContactAnimation("search");
		}
	};
	xhr.send(jsonPayload);
}

// Function to render the contacts table
function renderContactsTable(contacts) {
	let tbody = document.getElementById("contactsTableBody");
	let footerText = document.getElementById("contactsFooterText");
	if (!tbody) return;

	tbody.innerHTML = "";
	for (let i = 0; i < contacts.length; i++) {
		let c = contacts[i];
		let tr = document.createElement("tr");
		tr.className = "contacts-table-row";
		tr.setAttribute("data-contact-id", c.id);
		tr.innerHTML =
			"<td class=\"contacts-table-td\">" + escapeHtml(c.firstName) + "</td>" +
			"<td class=\"contacts-table-td\">" + escapeHtml(c.lastName) + "</td>" +
			"<td class=\"contacts-table-td\">" + escapeHtml(c.email || "") + "</td>" +
			"<td class=\"contacts-table-td\">" + escapeHtml(c.phone || "") + "</td>" +
			"<td class=\"contacts-table-td contacts-table-td-actions\">" +
			"<div class=\"contacts-action-btns\">" +
			"<button type=\"button\" class=\"contacts-btn-icon contacts-btn-edit\" aria-label=\"Edit\" onclick=\"openEditContactModal(" + c.id + ",'" + escapeJs(c.firstName) + "','" + escapeJs(c.lastName) + "','" + escapeJs(c.phone || "") + "','" + escapeJs(c.email || "") + "')\">" +
			"<span class=\"material-symbols-outlined\">edit</span></button>" +
			"<button type=\"button\" class=\"contacts-btn-icon contacts-btn-delete\" aria-label=\"Delete\" onclick=\"deleteContact(" + c.id + ")\">" +
			"<span class=\"material-symbols-outlined\">delete</span></button>" +
			"</div></td>";
		tbody.appendChild(tr);
	}

	if (footerText) footerText.textContent = "Showing " + contacts.length + " partners";
}

// Function to escape HTML
function escapeHtml(s) {
	if (!s) return "";
	let d = document.createElement("div");
	d.textContent = s;
	return d.innerHTML;
}

function escapeJs(s) {
	if (!s) return "";
	return String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, "\\\"");
}

function triggerContactAnimation(action, contactId, onComplete) {
	let el = document.getElementById("contactsTableBody");
	if (!el) return;
	el.classList.remove("contacts-anim-add", "contacts-anim-edit", "contacts-anim-delete", "contacts-anim-search");
	void el.offsetWidth;
	if (action === "add" || action === "search") {
		el.classList.add("contacts-anim-" + action);
		if (onComplete) setTimeout(onComplete, 400);
	} else if (action === "edit" && contactId) {
		let row = el.querySelector("[data-contact-id=\"" + contactId + "\"]");
		if (row) {
			row.classList.remove("contacts-row-edit-flash");
			void row.offsetWidth;
			row.classList.add("contacts-row-edit-flash");
		}
		if (onComplete) setTimeout(onComplete, 500);
	} else if (action === "delete" && contactId) {
		let row = el.querySelector("[data-contact-id=\"" + contactId + "\"]");
		if (row) {
			row.classList.add("contacts-row-delete");
			setTimeout(function () {
				if (onComplete) onComplete();
			}, 350);
		} else if (onComplete) onComplete();
	} else if (onComplete) onComplete();
}

function openAddContactModal() {
	document.getElementById("contactModalTitle").textContent = "Add Contact";
	document.getElementById("contactFirstName").value = "";
	document.getElementById("contactLastName").value = "";
	document.getElementById("contactPhone").value = "";
	document.getElementById("contactEmail").value = "";
	document.getElementById("contactFormResult").innerHTML = "";
	document.getElementById("contactModal").setAttribute("data-mode", "add");
	document.getElementById("contactModal").classList.add("contacts-modal-open");
}

function openEditContactModal(id, firstName, lastName, phone, email) {
	document.getElementById("contactModalTitle").textContent = "Edit Contact";
	document.getElementById("contactFirstName").value = firstName || "";
	document.getElementById("contactLastName").value = lastName || "";
	document.getElementById("contactPhone").value = phone || "";
	document.getElementById("contactEmail").value = email || "";
	document.getElementById("contactFormResult").innerHTML = "";
	document.getElementById("contactModal").setAttribute("data-mode", "edit");
	document.getElementById("contactModal").setAttribute("data-contact-id", id);
	document.getElementById("contactModal").classList.add("contacts-modal-open");
}

function closeContactModal() {
	document.getElementById("contactModal").classList.remove("contacts-modal-open");
}

function submitContactForm() {
	let modal = document.getElementById("contactModal");
	let mode = modal.getAttribute("data-mode");
	let id = modal.getAttribute("data-contact-id");
	if (mode === "edit" && id) editContact(id);
	else addContact();
}