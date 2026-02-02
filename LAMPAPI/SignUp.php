<?php
	$inData = getRequestInfo();
	$sqlUserName = "TheBeast";
	$sqlPassword = "WeLoveCOP4331";

	//json input
	$login = $inData["login"];
	$password = $inData["password"];
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];


	$conn = new mysqli("localhost", $sqlUserName, $sqlPassword, "COP4331");
	
	if($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}	
	else
	{
		//check if the username already exists in the users table
		$stmt = $conn->prepare("SELECT ID FROM Users WHERE Login = ?");
		$stmt->bind_param("s", $login);
		$stmt->execute();
		$result = $stmt->get_result();
		
		//it already exists
		if($result->num_rows > 0)
		{
			returnWithError("The account already exists, please sign in");
		}
		//does not exist, add to the table
		else
		{
			$stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES(?,?,?,?)");
			$stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
			if ($stmt->execute()) 
			{
				// Success: Return an empty error string to indicate no errors
				returnWithError("");
			} 
			else 
			{
				returnWithError("Error creating account: " . $stmt->error);
			}
		}
		$stmt->close();
		$conn->close();
	}


	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}	

	function sendResultInfoAsJson($obj)
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithError($err)
	{
		$retValue = '{"error":"'. $err . '"}';
		sendResultInfoAsJson($retValue);
	}
?>



