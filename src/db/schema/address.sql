CREATE TABLE IF NOT EXISTS address (
	id serial PRIMARY KEY,
	account_id uuid REFERENCES account(id) NOT NULL,

	currency varchar(5) NOT NULL,
	network varchar(20) NOT NULL,

	payment_information jsonb NOT NULL,

	-- AUDIT COLUMNS
	created_at timestamp with time zone NOT NULL DEFAULT(CURRENT_TIMESTAMP),
	updated_at timestamp with time zone NOT NULL DEFAULT(CURRENT_TIMESTAMP),

	-- CONSTRAINTS
	CONSTRAINT currency_length_nonzero CHECK(length(currency) > 0),
	CONSTRAINT network_length_nonzero CHECK(length(network) > 0),

	-- Note that the ordering here matters, since a SELECT with a WHERE clause on just `currency` will use the associated index,
	-- as will one for `(currency, network)`, but a SELECT with a WHERE clause on just `network` WILL NOT use the index.
	CONSTRAINT one_address_per_account_currency_network_tuple UNIQUE (currency, network, account_id)
);

-- INDEXES
--
-- Postgres only makes indexes on PRIMARY KEYs and UNIQUE constraints by default, so we need to create indexes on FOREIGN KEYs ourselves.
CREATE INDEX IF NOT EXISTS address_account_id_idx ON address(account_id);
