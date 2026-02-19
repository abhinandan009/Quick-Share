<?php
require "db.php";
date_default_timezone_set('Asia/Kolkata');

// Only allow POST with file
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['file'])) {
    die("ERROR|Invalid request");
}

$uploadDir = "../uploads/";

// Ensure uploads folder exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Original file name
$originalName = basename($_FILES["file"]["name"]);

// Stored file name (unique on server)
$storedName = time() . "_" . $originalName;

// Generate EXACT 6-character alphanumeric share code
$shareCode = strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));

// Expiry time: 24 hours from now
$expiresAt = date("Y-m-d H:i:s", time() + (24 * 60 * 60));

$targetFile = $uploadDir . $storedName;

// Move uploaded file
if (!move_uploaded_file($_FILES["file"]["tmp_name"], $targetFile)) {
    die("ERROR|Upload failed");
}

// Insert file details into database
$stmt = $conn->prepare("
    INSERT INTO files 
    (share_code, file_name, original_name, expires_at) 
    VALUES (?, ?, ?, ?)
");

$stmt->bind_param("ssss", $shareCode, $storedName, $originalName, $expiresAt);

if (!$stmt->execute()) {
    die("ERROR|Database insert failed");
}

// Cleanup
$stmt->close();
$conn->close();

// ✅ Return ONLY the share code
echo "SUCCESS|$shareCode";