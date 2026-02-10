<?php
	$inData = getRequestInfo();
	$userId = $inData["userId"];
	$search = isset($inData["search"]) ? $inData["search"] : "";
	$searchPattern = "%" . $search . "%";

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
		$stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email FROM Contacts WHERE (FirstName LIKE ? OR LastName LIKE ?) AND UserID = ? ORDER BY LastName, FirstName");
		$stmt->bind_param("ssi", $searchPattern, $searchPattern, $userId);
		$stmt->execute();
		$result = $stmt->get_result();

		$contacts = [];
		while ($row = $result->fetch_assoc())
		{
			$contacts[] = [
				"id" => (int)$row["ID"],
				"firstName" => $row["FirstName"],
				"lastName" => $row["LastName"],
				"phone" => $row["Phone"],
				"email" => $row["Email"]
			];
		}
		$stmt->close();
		$conn->close();
		returnWithInfo($contacts);
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
		sendResultInfoAsJson(json_encode(["results" => [], "error" => $err]));
	}

	function returnWithInfo($contacts)
	{
		sendResultInfoAsJson(json_encode(["results" => $contacts, "error" => ""]));
	}
?>
