CREATE TABLE IF NOT EXISTS address (
	id serial PRIMARY KEY,
	account_id uuid REFERENCES account(id) ON DELETE CASCADE NOT NULL,

	payment_network varchar(20) NOT NULL,
	environment varchar(20),

	details jsonb NOT NULL,

	identity_key_signature varchar,

	-- AUDIT COLUMNS
	created_at timestamp with time zone NOT NULL DEFAULT(CURRENT_TIMESTAMP),
	updated_at timestamp with time zone NOT NULL DEFAULT(CURRENT_TIMESTAMP),

	-- CONSTRAINTS
	CONSTRAINT payment_network_length_nonzero CHECK(length(payment_network) > 0),
	CONSTRAINT environment_length_nonzero CHECK(length(environment) > 0),

	CONSTRAINT payment_network_uppercase CHECK (upper(payment_network) = payment_network),
	CONSTRAINT environment_uppercase CHECK(upper(environment) = environment),

	-- Note that the ordering here matters, since a SELECT with a WHERE clause on just `payment_network` will use the associated index,
	-- as will one for `(payment_network, environment)`, but a SELECT with a WHERE clause on just `environment` WILL NOT use the index.
	CONSTRAINT one_address_per_account_payment_network_environment_tuple UNIQUE (payment_network, environment, account_id)
);

-- INDEXES
--
-- Postgres only makes indexes on PRIMARY KEYs and UNIQUE constraints by default, so we need to create indexes on FOREIGN KEYs ourselves.
CREATE INDEX IF NOT EXISTS address_account_id_idx ON address(account_id);
