BEGIN TRANSACTION;

-- Alters the regex constraint to check for valid PayIDs.
-- This regex is much stricter and more accurate, based on email regexes.
ALTER TABLE account
DROP CONSTRAINT IF EXISTS valid_pay_id;

ALTER TABLE account
ADD CONSTRAINT valid_pay_id CHECK(pay_id ~ '^[a-z0-9!#@%&*+/=?^_`{|}~-]+(?:\.[a-z0-9!#@%&*+/=?^_`{|}~-]+)*\$(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z-]*[a-z0-9])?|(?:[0-9]{1,3}\.){3}[0-9]{1,3})$');

END TRANSACTION;
