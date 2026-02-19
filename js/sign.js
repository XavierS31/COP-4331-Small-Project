//const urlBase = 'http://134.199.201.212/LAMPAPI';
const urlBase = 'http://cop4331-11-domain.xyz/LAMPAPI';
const extension = 'php';

// Variables to store the user information
let userId = 0;
let firstName = "";
let lastName = "";

// Function to login
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

// Function to logout
function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

// Function to open the modal
function openSignUpModal() {
    document.getElementById("signUpModal").style.display = "block";
}

// Function to close the modal
function closeSignUpModal() {
    document.getElementById("signUpModal").style.display = "none";
}

// Function to sign up
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
