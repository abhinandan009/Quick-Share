<?php
require "db.php";
date_default_timezone_set('Asia/Kolkata');
$conn->query("SET time_zone = '+05:30'");

// Get expired files
$result = $conn->query("
    SELECT id, file_name 
    FROM files 
    WHERE expires_at < NOW()
");

if ($result->num_rows === 0) {
    echo "No expired files";
    exit;
}

while ($row = $result->fetch_assoc()) {

    $filePath = "../uploads/" . $row['file_name'];

    // Delete file from folder
    if (file_exists($filePath)) {
        unlink($filePath);
    }

    // Delete record from database
    $stmt = $conn->prepare("DELETE FROM files WHERE id = ?");
    $stmt->bind_param("i", $row['id']);
    $stmt->execute();
}

echo "Expired files cleaned successfully";