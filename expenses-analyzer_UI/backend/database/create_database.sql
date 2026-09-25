-- =============================================================
-- database/create_database.sql
--
-- SQL Server setup script for Expense Analyzer.
-- Run this in SQL Server Management Studio (SSMS) or sqlcmd.
--
-- What this script does:
--   1. Creates the ExpenseAnalyzerDB database (if it doesn't exist)
--   2. Switches to that database
--   3. Creates the Expenses table
-- =============================================================


-- -------------------------------------------------------------
-- Step 1: Create the database
--
-- IF NOT EXISTS means it's safe to run this script multiple times.
-- It won't error if the database already exists.
-- -------------------------------------------------------------
IF NOT EXISTS (
    SELECT name FROM sys.databases WHERE name = 'ExpenseAnalyzerDB'
)
BEGIN
    CREATE DATABASE ExpenseAnalyzerDB;
    PRINT 'Database ExpenseAnalyzerDB created successfully.';
END
ELSE
BEGIN
    PRINT 'Database ExpenseAnalyzerDB already exists.';
END
GO

-- Switch to the new database
USE ExpenseAnalyzerDB;
GO


-- -------------------------------------------------------------
-- Step 2: Create the Expenses table
--
-- IF NOT EXISTS — safe to re-run without errors
-- -------------------------------------------------------------
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_NAME = 'Expenses'
)
BEGIN

    CREATE TABLE Expenses (

        -- Primary Key
        -- IDENTITY(1,1) = start at 1, increment by 1 automatically
        -- You never insert this value manually — SQL Server handles it
        Id              INT             IDENTITY(1,1)   NOT NULL,

        -- Expense description — required, max 200 chars
        -- NVARCHAR stores Unicode (supports ₹, Hindi, etc.)
        Description     NVARCHAR(200)                   NOT NULL,

        -- Amount in Indian Rupees
        -- DECIMAL(10, 2): up to 10 total digits, 2 after the decimal
        -- Example: 99999999.99 (max), 100.50 (typical)
        -- NEVER use FLOAT for money — floating point is imprecise
        Amount          DECIMAL(10, 2)                  NOT NULL,

        -- Expense category — Food, Travel, Shopping, etc.
        Category        NVARCHAR(50)                    NOT NULL,

        -- The date of the expense (date only, no time needed)
        -- DATE stores: 2026-09-19  (no time component)
        ExpenseDate     DATE                            NOT NULL,

        -- Payment method — UPI, Card, Cash, Net Banking
        PaymentMethod   NVARCHAR(50)                    NOT NULL,

        -- Optional notes — NULL is allowed because notes are optional
        Notes           NVARCHAR(500)                   NULL,

        -- Audit timestamps
        -- DATETIME2 is more precise than DATETIME, recommended for new tables
        -- DEFAULT GETDATE() means SQL Server fills this in automatically on INSERT
        CreatedAt       DATETIME2                       NOT NULL    DEFAULT GETDATE(),
        UpdatedAt       DATETIME2                       NOT NULL    DEFAULT GETDATE(),

        -- Primary Key constraint
        CONSTRAINT PK_Expenses PRIMARY KEY (Id)
    );

    PRINT 'Table Expenses created successfully.';
END
ELSE
BEGIN
    PRINT 'Table Expenses already exists.';
END
GO


-- -------------------------------------------------------------
-- Step 3: Verify the table was created
-- -------------------------------------------------------------
SELECT
    COLUMN_NAME         AS [Column],
    DATA_TYPE           AS [Type],
    CHARACTER_MAXIMUM_LENGTH AS [MaxLength],
    IS_NULLABLE         AS [Nullable],
    COLUMN_DEFAULT      AS [Default]
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_NAME = 'Expenses'
ORDER BY
    ORDINAL_POSITION;
GO

PRINT 'Setup complete. Database: ExpenseAnalyzerDB, Table: Expenses';
GO
