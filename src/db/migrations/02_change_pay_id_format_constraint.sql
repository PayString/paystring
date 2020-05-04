-- Update the regex validating PayIDs to guarantee a lowercase user
ALTER TABLE account DROP CONSTRAINT IF EXISTS pay_id_valid_url;
-- Need to drop this as well because our tests re-execute this file
-- and will error if it tries to create it when it already exists
ALTER TABLE account DROP CONSTRAINT IF EXISTS valid_pay_id;
ALTER TABLE account ADD CONSTRAINT valid_pay_id CHECK(pay_id ~ '^([a-z0-9\-\_\.]+)(?:\$)[^\s/$.?#].+\.[^\s]+$');
