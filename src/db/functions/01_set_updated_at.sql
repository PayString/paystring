-- Assuming the table has an `updated_at` column,
-- we can use this function to write an update trigger
-- that automatically updates the `updated_at` column.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = CURRENT_TIMESTAMP;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;


COMMENT ON FUNCTION set_updated_at IS 'Used in triggers. Updates the `updated_at` field of the table.';
