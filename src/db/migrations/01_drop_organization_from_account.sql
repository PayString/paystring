-- Remove the organization column from account.
--
-- This column was going to be used for a "hosted PayID" idea, where multiple organizations
-- would outsource their PayID server implementation to a hosted provider.
-- However, we currently don't do any authentication for the Admin API,
-- which means that our reference implementation could not be a hosted solution anyways.
ALTER TABLE account
DROP COLUMN IF EXISTS organization;
