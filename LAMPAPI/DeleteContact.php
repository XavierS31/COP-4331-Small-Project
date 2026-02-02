<?php

    $inData = getRequestInfo();

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error)
    {
        returnWithError($conn->connect_error);
    }
    else
    {
        // Delete ONLY the contact that belongs to this user
        $stmt = $conn->prepare(
            "DELETE FROM Contacts WHERE ID = ? AND UserID = ?"
        );
        $stmt->bind_param("ii", $inData["id"], $inData["userId"]);
        $stmt->execute();

        if ($stmt->affected_rows == 0)
        {
            returnWithError("No record deleted");
        }
        else
        {
            returnWithInfo("Contact deleted");
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
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

    function returnWithInfo($msg)
    {
        $retValue = '{"message":"' . $msg . '","error":""}';
        sendResultInfoAsJson($retValue);
    }

?>
