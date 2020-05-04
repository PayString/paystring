BEGIN TRANSACTION;

-- Add constraints to assert that (payment_network, environment) are always stored all uppercase.
-- This is fine because both of those should be case-insensitive.
ALTER TABLE address
DROP CONSTRAINT IF EXISTS payment_network_uppercase;

ALTER TABLE address
DROP CONSTRAINT IF EXISTS environment_uppercase;



ALTER TABLE address
ADD CONSTRAINT payment_network_uppercase CHECK (upper(payment_network) = payment_network);

ALTER TABLE address
ADD CONSTRAINT environment_uppercase CHECK(upper(environment) = environment);

END TRANSACTION;
