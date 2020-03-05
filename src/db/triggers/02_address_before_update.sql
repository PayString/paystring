-- Wrap the DROP/CREATE in a TRANSACTION,
-- because Postgres doesn't support CREATE TRIGGER IF NOT EXISTS syntax.
-- This way it is always safe to execute this file.
BEGIN TRANSACTION;

DROP TRIGGER IF EXISTS address_before_update ON address;

CREATE TRIGGER address_before_update
BEFORE UPDATE ON address
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


COMMENT ON TRIGGER address_before_update ON address IS 'Update the `updated_at` field for every row updated.';

END TRANSACTION;
