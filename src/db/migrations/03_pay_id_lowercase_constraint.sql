BEGIN TRANSACTION;

-- Add a constraint to assert that PayIDs are always stored all lowercase.
-- This is fine because PayIDs should be case-insensitive.
ALTER TABLE account
DROP CONSTRAINT IF EXISTS pay_id_lowercase;

ALTER TABLE account
ADD CONSTRAINT pay_id_lowercase CHECK(lower(pay_id) = pay_id);

END TRANSACTION;
