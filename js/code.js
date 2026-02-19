//const urlBase = 'http://134.199.201.212/LAMPAPI';
const urlBase = 'http://cop4331-11-domain.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
//	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "contacts.html"; 
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

// Function to save the cookie
function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

// Function to read the cookie
function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function goToContacts()
{
	window.location.href = "contacts.html";
}

function addColor()
{
	let newColor = document.getElementById("colorText").value;
	document.getElementById("colorAddResult").innerHTML = "";

	let tmp = {color:newColor,userId,userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddColor.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorAddResult").innerHTML = "Color has been added";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorAddResult").innerHTML = err.message;
	}
	
}

function searchColor()
{
	let srch = document.getElementById("searchText").value;
	document.getElementById("colorSearchResult").innerHTML = "";
	
	let colorList = "";

	let tmp = {search:srch,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchColors.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorSearchResult").innerHTML = "Color(s) has been retrieved";
				let jsonObject = JSON.parse( xhr.responseText );
				
				for( let i=0; i<jsonObject.results.length; i++ )
				{
					colorList += jsonObject.results[i];
					if( i < jsonObject.results.length - 1 )
					{
						colorList += "<br />\r\n";
					}
				}
				
				document.getElementsByTagName("p")[0].innerHTML = colorList;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorSearchResult").innerHTML = err.message;
	}
	
}

// Function to open the modal
function openSignUpModal() {
    document.getElementById("signUpModal").style.display = "block";
}

// Function to close the modal
function closeSignUpModal() {
    document.getElementById("signUpModal").style.display = "none";
}

// ========== Contact CRUD ==========
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

function searchContacts() {
	let search = "";
	let input = document.getElementById("contactsSearchInput");
	if (input) search = input.value.trim();

	let tmp = { search, userId };
	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + '/GetContacts.' + extension;

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

function doSignUp() {
    let firstName = document.getElementById("regFirstName").value;
    let lastName = document.getElementById("regLastName").value;
    let login = document.getElementById("regLogin").value;
    let password = document.getElementById("regPassword").value;

    document.getElementById("signUpResult").innerHTML = "";

    // Package the data for your SignUp.php API
    let tmp = {
        firstName: firstName,
        lastName: lastName,
        login: login,
        password: password
    };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/SignUp.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                
                if (jsonObject.error && jsonObject.error.length > 0) {
                    document.getElementById("signUpResult").innerHTML = jsonObject.error;
                    return;
                }

                document.getElementById("signUpResult").innerHTML = "Successfully Registered!";
                setTimeout(closeSignUpModal, 2000); // Close after 2 seconds
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("signUpResult").innerHTML = err.message;
    }
}
