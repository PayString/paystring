-- We use a UUID id column because the Travel Rule requires exhanging an account number,
-- and we wouldn't want to expose a monotonically increasing integer.

CREATE TABLE IF NOT EXISTS account (
	id uuid PRIMARY KEY DEFAULT(gen_random_uuid()),
	payment_pointer varchar(200) UNIQUE NOT NULL,

	-- AUDIT COLUMNS
	created_at timestamp with time zone NOT NULL DEFAULT(CURRENT_TIMESTAMP),
	updated_at timestamp with time zone NOT NULL DEFAULT(CURRENT_TIMESTAMP),

	-- CONSTRAINTS
	CONSTRAINT payment_pointer_length_nonzero CHECK(length(payment_pointer) > 0),

	-- This is a black magic URL regex from https://mathiasbynens.be/demo/url-regex
	-- It is an adaptation of the 'stephenhay' implementation, which was the shortest URL regex I could find.
	-- Also, that implementation had no false negatives, which is important, as we never want to prevent a valid URL from being used.
	--
	-- This regex requires payment pointers of the form `https://example.com/...`
	CONSTRAINT payment_pointer_valid_url CHECK(payment_pointer ~* '^(?:https://)[^\s/$.?#].[^\s]*/[^\s]+$')
);
