<?php
/**
 * Database configuration file for the SCMS Paper Insights web application.
 *
 * This file establishes a connection to the local MySQL database using PDO.
 * It is designed for development use with XAMPP (default settings).
 * 
 * @author Hiran Greening
 * @version 1.0
 * @since 2025-10-24
 */

// Database connection parameters (XAMPP default setup)
$host = 'localhost';          // Database server host
$dbname = 'paper_insights_db';       // Name of the target database
$username = 'root';           // MySQL username (default for XAMPP)
$password = '';               // MySQL password (empty by default in XAMPP)

try {
    // Create a new PDO instance to connect to the MySQL database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    
    // Set PDO to throw exceptions on error for better debugging and control flow
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    // Halt execution and display a user-friendly error if connection fails
    die("Could not connect to the database: " . htmlspecialchars($e->getMessage()));
}
?>