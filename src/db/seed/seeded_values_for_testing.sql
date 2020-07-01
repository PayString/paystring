BEGIN TRANSACTION;

TRUNCATE account, address;

INSERT INTO account(id, pay_id) VALUES
('232370e9-045e-4269-96ec-5a79091d65ff', 'alice$127.0.0.1'),
('223ece9c-2a15-48e1-9df6-d9ac77c5db90', 'bob$127.0.0.1'),
('ec06236e-d134-4a7b-b69e-0606fb54b67b', 'alice$xpring.money'),
('69b0d20a-cdef-4bb9-adf9-2109979a12af', 'bob$xpring.money'),
('b253bed2-79ce-45d0-bbdd-96867aa85fd5', 'zebra$xpring.money');

INSERT INTO address(account_id, payment_network, environment, details) VALUES
('232370e9-045e-4269-96ec-5a79091d65ff', 'XRPL', 'MAINNET', '{"address": "rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg", "tag": "67298042"}'),
('232370e9-045e-4269-96ec-5a79091d65ff', 'XRPL', 'TESTNET', '{"address": "rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS"}'),
('232370e9-045e-4269-96ec-5a79091d65ff', 'BTC',  'TESTNET', '{"address": "mxNEbRXokcdJtT6sbukr1CTGVx8Tkxk3DB"}'),
('232370e9-045e-4269-96ec-5a79091d65ff', 'ACH',   NULL,     '{"accountNumber": "000123456789", "routingNumber": "123456789"}'),
('223ece9c-2a15-48e1-9df6-d9ac77c5db90', 'XRPL', 'TESTNET', '{"address": "rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS"}'),
('ec06236e-d134-4a7b-b69e-0606fb54b67b', 'XRPL', 'TESTNET', '{"address": "rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS"}'),
('69b0d20a-cdef-4bb9-adf9-2109979a12af', 'XRPL', 'TESTNET', '{"address": "rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS"}'),
('b253bed2-79ce-45d0-bbdd-96867aa85fd5', 'INTERLEDGER', 'TESTNET', '{"address": "$xpring.money/zebra"}');


END TRANSACTION;
