<?php
/**
 * Handles dynamic search and filtering of papers for the SCMS Paper Insights application.
 *
 * This endpoint supports:
 * - Full-text search across paper code, name, and lecturer names
 * - Filtering by academic year, trimester, level, and subject
 * - Advanced occurrence-based filtering for precise results
 * Returns aggregated paper data including average pass rates, enrolment stats,
 * total occurrences, and most recent offering details.
 *
 * Used by the frontend to power the responsive search bar and filter dropdowns
 * on the main page (see Section 4.3 and Figure 4 of the final report).
 *
 * @author Hiran Greening
 * @version 1.7
 * @since 2025-10-24
 */

// Ensure the client interprets the response as JSON
header('Content-Type: application/json');

// Load database connection settings
include 'config.php';

// Retrieve and sanitise user input
$searchTerm = isset($_GET['q']) ? trim($_GET['q']) : '';
$yearFilter = isset($_GET['year']) ? intval($_GET['year']) : 0;
$trimesters = isset($_GET['trimesters']) ? $_GET['trimesters'] : '';
$level = isset($_GET['level']) ? $_GET['level'] : '';
$subject = isset($_GET['subject']) ? $_GET['subject'] : '';

try {
    /*
     * Construct a dynamic SQL query to fetch unique papers with aggregated metrics.
     * - Joins Paper → Occurrence → Occurrence_Staff → Staff to enable lecturer-based search.
     * - Uses GROUP BY to return one row per paper.
     * - Subquery determines the most recent trimester using FIELD() for correct A/B/C ordering.
     * - Uses EXISTS clauses for efficient occurrence-based filtering.
     */
    $sql = "SELECT DISTINCT
                p.paper_id,
                p.paper_code,
                p.paper_name,
                AVG(o.pass_rate) as avg_pass_rate,
                AVG(o.num_students) as avg_num_students,
                COUNT(o.occurrence_id) as total_occurrences,
                GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as lecturers,
                MAX(o.year) as most_recent_year,
                (SELECT o2.trimester 
                 FROM Occurrence o2 
                 WHERE o2.paper_id = p.paper_id 
                 ORDER BY o2.year DESC, 
                          FIELD(o2.trimester, 'A', 'B', 'C') DESC 
                 LIMIT 1) as most_recent_trimester
            FROM Paper p
            JOIN Occurrence o ON p.paper_id = o.paper_id
            LEFT JOIN Occurrence_Staff os ON o.occurrence_id = os.occurrence_id
            LEFT JOIN Staff s ON os.staff_id = s.staff_id
            WHERE 1=1"; // Base condition to simplify dynamic WHERE clause

    $params = [];

    // Apply case-insensitive partial match across paper code, name, and lecturer name
    if (!empty($searchTerm)) {
        $sql .= " AND (p.paper_code LIKE :searchTerm 
                       OR p.paper_name LIKE :searchTerm 
                       OR s.name LIKE :searchTerm)";
        $params[':searchTerm'] = "%$searchTerm%";
    }

    // Filter by specific academic year (if provided) - papers that HAVE occurrences in this year
    if ($yearFilter > 0) {
        $sql .= " AND EXISTS (
            SELECT 1 FROM Occurrence o_year 
            WHERE o_year.paper_id = p.paper_id 
            AND o_year.year = :yearFilter
        )";
        $params[':yearFilter'] = $yearFilter;
    }

    // Filter by trimester - papers that HAVE occurrences in these trimesters
    // Convert "A Trimester" → "A", "B Trimester" → "B" to match database
    if (!empty($trimesters)) {
        $trimesterArray = explode(',', $trimesters);
        if (!empty($trimesterArray)) {
            $placeholders = [];
            foreach ($trimesterArray as $index => $trimester) {
                // Extract just the first letter from "A Trimester", "B Trimester", etc.
                $trimesterLetter = trim($trimester)[0]; // Gets 'A' from "A Trimester"
                $paramName = ":trimester" . $index;
                $placeholders[] = $paramName;
                $params[$paramName] = $trimesterLetter;
            }
            $placeholderString = implode(',', $placeholders);
            $sql .= " AND EXISTS (
                SELECT 1 FROM Occurrence o_trimester 
                WHERE o_trimester.paper_id = p.paper_id 
                AND o_trimester.trimester IN ($placeholderString)
            )";
        }
    }

    // Filter by paper level - finds the first numeric digit in paper code
    if (!empty($level)) {
        // Extract just the first digit from level input
        $levelDigit = substr($level, 0, 1);
        
        // Regex pattern: letters followed by level digit followed by numbers
        $levelPattern = '[A-Za-z]+' . $levelDigit . '[0-9]*';
        
        // Apply level filter using EXISTS for consistency with other filters
        $sql .= " AND EXISTS (
            SELECT 1 
            FROM Paper p_level 
            WHERE p_level.paper_id = p.paper_id 
            AND p_level.paper_code REGEXP :levelPattern
        )";
        $params[':levelPattern'] = $levelPattern;
    }

    // Filter by subject - from paper_code prefix
    if (!empty($subject)) {
        $sql .= " AND p.paper_code LIKE :subject";
        $params[':subject'] = $subject . '%';
    }

    // Group by paper to ensure one result per paper
    $sql .= " GROUP BY p.paper_id, p.paper_code, p.paper_name";

    // Sort results alphabetically by paper code for consistent UX
    $sql .= " ORDER BY p.paper_code";

    // Execute the parameterised query securely
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $papers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Post-process raw database results for frontend consumption
    $processedPapers = [];
    foreach ($papers as $paper) {
        // Round numeric values for cleaner display
        $avgPassRate = $paper['avg_pass_rate'] !== null 
            ? round(floatval($paper['avg_pass_rate']), 2) 
            : null;
        $avgNumStudents = $paper['avg_num_students'] !== null 
            ? round(floatval($paper['avg_num_students'])) 
            : null;

        // Build a clean, typed response object
        $processedPaper = [
            'paper_id' => intval($paper['paper_id']),
            'paper_code' => $paper['paper_code'],
            'paper_name' => $paper['paper_name'],
            'avg_pass_rate' => $avgPassRate,
            'avg_num_students' => $avgNumStudents,
            'total_occurrences' => intval($paper['total_occurrences']),
            'lecturers' => $paper['lecturers'] ?: 'N/A',
            'year' => $paper['most_recent_year'] ?? 'N/A',
            'trimester' => $paper['most_recent_trimester'] ?? 'N/A'
        ];
        $processedPapers[] = $processedPaper;
    }

    // Return the final JSON response
    echo json_encode($processedPapers);

} catch (PDOException $e) {
    // Handle database-level errors
    http_response_code(500); // Internal Server Error
    echo json_encode(["error" => "Database error"]);
} catch (Exception $e) {
    // Handle any other unexpected errors
    http_response_code(500);
    echo json_encode(["error" => "An error occurred"]);
}
?>