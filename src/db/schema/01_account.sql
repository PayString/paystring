-- We use a UUID id column because the Travel Rule requires exchanging an account number,
-- and we wouldn't want to expose a monotonically increasing integer.

CREATE TABLE IF NOT EXISTS account (
	id uuid PRIMARY KEY DEFAULT(gen_random_uuid()),
	pay_id varchar(200) UNIQUE NOT NULL,
	identity_key varchar,

	-- AUDIT COLUMNS
	created_at timestamp with time zone NOT NULL DEFAULT(CURRENT_TIMESTAMP),
	updated_at timestamp with time zone NOT NULL DEFAULT(CURRENT_TIMESTAMP),

	-- CONSTRAINTS
	CONSTRAINT pay_id_length_nonzero CHECK(length(pay_id) > 0),
	CONSTRAINT pay_id_lowercase CHECK(lower(pay_id) = pay_id),

	-- Regex discussion: https://github.com/payid-org/payid/issues/345
    CONSTRAINT valid_pay_id CHECK(pay_id ~ '^[a-z0-9!#@%&*+/=?^_`{|}~-]+(?:\.[a-z0-9!#@%&*+/=?^_`{|}~-]+)*\$(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z-]*[a-z0-9])?|(?:[0-9]{1,3}\.){3}[0-9]{1,3})$')
);
