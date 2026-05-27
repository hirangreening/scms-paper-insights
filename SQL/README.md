# SCMS Paper Insights - Database Setup

## Quick Setup

Import in this order (required):
```bash
mysql -u root -p paper_insights_db < schema.sql
mysql -u root -p paper_insights_db < data.sql
mysql -u root -p paper_insights_db < constraints.sql
```

## phpMyAdmin Alternative

1. Create database: paper_insights_db
2. Import `schema.sql`
3. Import `data.sql`
4. Import `constraints.sql`

## Verify

`SELECT COUNT(*) FROM Paper;     - 83`
`SELECT COUNT(*) FROM Staff;     - 37`
`SELECT COUNT(*) FROM Occurrence; - 723`

## Files

`schema.sql`      - Creates 4 tables
`data.sql`        - Inserts 83 papers, 37 staff, 723 occurrences
`constraints.sql` - Adds foreign keys, indexes, unique constraints

## Notes

- All data is fictional / for demonstration
- No duplicate offerings (unique constraint)
- Foreign keys use CASCADE for data integrity
