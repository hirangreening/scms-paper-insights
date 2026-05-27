<?php
/**
 * Fetches historical occurrences of a specific paper for the SCMS Paper Insights application.
 *
 * This endpoint accepts a paper_id via GET request, validates it, and returns all
 * associated occurrences (including staff, enrolment, and performance metrics)
 * as a JSON response. Designed to power the paper detail modal in the frontend.
 *
 * @author Hiran Greening
 * @version 1.0
 * @since 2025-10-24
 */

// Set response content type to JSON
header('Content-Type: application/json');

// Load database configuration
include 'config.php';

// Retrieve and sanitise the paper_id from the query string
$paper_id = isset($_GET['paper_id']) ? intval($_GET['paper_id']) : 0;

// Validate input: paper_id must be a positive integer
if ($paper_id <= 0) {
    echo json_encode(["error" => "Invalid paper ID"]);
    exit;
}

try {
    // SQL query to fetch all historical occurrences of the given paper,
    // including associated staff members and their roles.
    // Uses JOINs to link Paper → Occurrence → Occurrence_Staff → Staff.
    $sql = "SELECT 
                p.paper_id, 
                p.paper_code, 
                p.paper_name,
                o.occurrence_id,
                o.year, 
                o.trimester, 
                o.num_students, 
                o.pass_rate,
                GROUP_CONCAT(DISTINCT CONCAT(s.name, ' (', os.role, ')') SEPARATOR ', ') as staff
            FROM Paper p
            JOIN Occurrence o ON p.paper_id = o.paper_id
            LEFT JOIN Occurrence_Staff os ON o.occurrence_id = os.occurrence_id
            LEFT JOIN Staff s ON os.staff_id = s.staff_id
            WHERE p.paper_id = ?
            GROUP BY o.occurrence_id
            ORDER BY o.year DESC, o.trimester, o.occurrence_id";
    
    // Use prepared statement to prevent SQL injection
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$paper_id]);
    $occurrences = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return results or a "not found" message
    if ($occurrences) {
        echo json_encode($occurrences);
    } else {
        echo json_encode(["error" => "No occurrences found for this paper"]);
    }
} catch (PDOException $e) {
    // Return a generic error message to avoid exposing internal details
    echo json_encode(["error" => "Database error"]);
}
?>