<?php
/**
 * Database utility functions for the SCMS Paper Insights web application.
 *
 * This file provides a reusable wrapper function for executing parameterised
 * SQL queries using the PDO connection established in config.php.
 *
 * @author Hiran Greening
 * @version 1.0
 * @since 2025-10-24
 */

// Include the database connection configuration
require_once 'config.php';

/**
 * Executes a parameterised SQL query and returns all results as an associative array.
 *
 * This function uses prepared statements to prevent SQL injection and supports
 * optional bound parameters for dynamic queries (e.g., filtering by paper code or year).
 *
 * @param string $sql    The SQL query string with placeholders (e.g., :paper_code)
 * @param array  $params Optional array of parameter values to bind to the query
 * @return array         Associative array of query results; empty array if no rows found
 * @throws PDOException  If the query fails (handled by PDO's ERRMODE_EXCEPTION)
 */
function executeQuery($sql, $params = []) {
    global $pdo; // Use the PDO instance from config.php
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>