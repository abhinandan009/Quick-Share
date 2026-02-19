<?php
require "db.php";

if (!isset($_GET['code']) || empty($_GET['code'])) {
    header("Location: /quick_share/error.html?type=invalid");
    exit;
}

$code = strtoupper(trim($_GET['code']));

$stmt = $conn->prepare("
    SELECT id, file_name, original_name, expires_at, download_count, max_downloads
    FROM files
    WHERE share_code = ?
    LIMIT 1
");
$stmt->bind_param("s", $code);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    header("Location: /quick_share/error.html?type=invalid");
    exit;
}

$file = $result->fetch_assoc();

if (!empty($file['expires_at']) && strtotime($file['expires_at']) < time()) {
    header("Location: /quick_share/error.html?type=expired");
    exit;
}

if ((int)$file['download_count'] >= (int)$file['max_downloads']) {
    header("Location: /quick_share/error.html?type=limit");
    exit;
}

$filePath = "../uploads/" . $file['file_name'];

if (!file_exists($filePath)) {
    header("Location: /quick_share/error.html?type=invalid");
    exit;
}

$update = $conn->prepare("UPDATE files SET download_count = download_count + 1 WHERE id = ?");
$update->bind_param("i", $file['id']);
$update->execute();

header("Content-Type: application/octet-stream");
header("Content-Disposition: attachment; filename=\"" . basename($file['original_name']) . "\"");
header("Content-Length: " . filesize($filePath));
header("Cache-Control: no-cache, must-revalidate");
header("Pragma: no-cache");

readfile($filePath);
exit;
?>