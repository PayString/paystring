-- Add identity key column to account
--
-- This column is used to store user generated identity keys so that clients
-- querying addresses can verify the individual user confirmed ownership
-- of an address via a signature.
ALTER TABLE account
ADD COLUMN IF NOT EXISTS identity_key varchar;
