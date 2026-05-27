<?php
/**
 * Fetches a list of all papers for the SCMS Paper Insights web application.
 *
 * This endpoint returns basic metadata for every paper in the database
 * (e.g., paper_code, paper_name) as a JSON array, sorted alphabetically
 * by paper code. It powers the main paper grid view on the homepage.
 *
 * @author Hiran Greening
 * @version 1.0
 * @since 2025-10-24
 */

// Ensure the response is interpreted as JSON by the client
header('Content-Type: application/json');

// Load the database connection configuration
include 'config.php';

try {
    // Retrieve all papers from the Paper table, ordered by paper code for consistent display
    $sql = "SELECT * FROM Paper ORDER BY paper_code";

    // Prepare and execute the query using PDO (safe even without parameters, but consistent with pattern)
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $papers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return the full list of papers as JSON
    echo json_encode($papers);
} catch (PDOException $e) {
    // Return a structured error response in case of database failure
    echo json_encode(["error" => "Database error"]);
}
?>