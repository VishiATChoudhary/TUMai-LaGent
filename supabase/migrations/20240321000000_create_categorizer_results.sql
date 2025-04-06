-- Create categorizer_results table
CREATE TABLE IF NOT EXISTS categorizer_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_content TEXT NOT NULL,
    flag TEXT NOT NULL,
    urgency TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on flag for faster queries
CREATE INDEX IF NOT EXISTS idx_categorizer_results_flag ON categorizer_results(flag);

-- Create index on urgency for faster queries
CREATE INDEX IF NOT EXISTS idx_categorizer_results_urgency ON categorizer_results(urgency);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_categorizer_results_created_at ON categorizer_results(created_at); 