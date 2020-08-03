-- Add identity key signature field to account table
--
-- This column will be used to store user signatures confirming
-- ownership of an address.
ALTER TABLE address
ADD COLUMN IF NOT EXISTS identity_key_signature varchar;
