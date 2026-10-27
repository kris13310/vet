<?php
declare(strict_types=1);
// XAMPP defaults. Change these values if your MySQL credentials differ.
$host = '127.0.0.1';
$dbname = 'veterinary_clinic_db';
$dbuser = 'root';
$dbpass = '';
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $dbuser, $dbpass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
} catch (PDOException $e) {
    error_log('Veterinary DB connection failed: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'Cannot connect to database. Import database/veterinary_clinic_db.sql in phpMyAdmin and check config.php.']);
    exit;
}
