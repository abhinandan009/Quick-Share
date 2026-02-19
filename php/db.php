<?php
$conn = new mysqli("localhost", "root", "", "quick_share");

if ($conn->connect_error) {
    die("Database connection failed");
}
?>
