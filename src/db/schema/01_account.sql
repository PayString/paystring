-- We use a UUID id column because the Travel Rule requires exchanging an account number,
-- and we wouldn't want to expose a monotonically increasing integer.

CREATE TABLE IF NOT EXISTS account (
	id uuid PRIMARY KEY DEFAULT(gen_random_uuid()),
	pay_id varchar(200) UNIQUE NOT NULL,

	-- AUDIT COLUMNS
	created_at timestamp with time zone NOT NULL DEFAULT(CURRENT_TIMESTAMP),
	updated_at timestamp with time zone NOT NULL DEFAULT(CURRENT_TIMESTAMP),

	-- CONSTRAINTS
	CONSTRAINT pay_id_length_nonzero CHECK(length(pay_id) > 0),
	CONSTRAINT pay_id_lowercase CHECK(lower(pay_id) = pay_id),

	-- The regex after the middle '$' is a black magic URL regex from https://mathiasbynens.be/demo/url-regex
	-- It is an adaptation of the 'stephenhay' implementation, which was the shortest URL regex I could find.
	-- Also, that implementation had no false negatives, which is important, as we never want to prevent a valid URL from being used.
	-- This regex requires PayIDs of the form `user$[subdomain.]example.com`
        CONSTRAINT valid_pay_id CHECK(pay_id ~ '^([a-z0-9\-\_\.]+)(?:\$)[^\s/$.?#].+\.[^\s]+$')
);
