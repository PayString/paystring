-- We use a UUID id column because the Travel Rule requires exchanging an account number,
-- and we wouldn't want to expose a monotonically increasing integer.

CREATE TABLE IF NOT EXISTS account (
	id uuid PRIMARY KEY DEFAULT(gen_random_uuid()),
	pay_id varchar(200) UNIQUE NOT NULL,
	organization varchar(50) NOT NULL,

	-- AUDIT COLUMNS
	created_at timestamp with time zone NOT NULL DEFAULT(CURRENT_TIMESTAMP),
	updated_at timestamp with time zone NOT NULL DEFAULT(CURRENT_TIMESTAMP),

	-- CONSTRAINTS
	CONSTRAINT pay_id_length_nonzero CHECK(length(pay_id) > 0),
	CONSTRAINT organization_length_nonzero CHECK(length(organization) > 0)

	-- This is a black magic PayID regex from https://mathiasbynens.be/demo/url-regex
	-- It is an adaptation of the 'stephenhay' implementation, which was the shortest URL regex I could find.
	-- Also, that implementation had no false negatives, which is important, as we never want to prevent a valid URL from being used.
	--
	-- This regex requires PayIDs of the form `user$[subdomain.]example.com[/path]`
        -- TODO(aking): update this to reflect the new format
        -- NOTE: I'm just disabling this so that I can add the values that Ted needs for the SDK integration tests,
        -- it will be turned back on when my next PR is merged and we only have the new format PayIDs as seeds.
	-- CONSTRAINT pay_id_valid_url CHECK(pay_id ~* '^(?:\$)[^\s/$.?#].+\.[^\s]+$')
);
