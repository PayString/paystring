-- Originally this was only 5, extending to be more inclusive
-- of networks with longer names like interledger
ALTER TABLE address
ALTER COLUMN payment_network type varchar(20);
