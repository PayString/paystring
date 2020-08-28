BEGIN TRANSACTION;

TRUNCATE account, address;

/* Unverified Accounts */
INSERT INTO account(id, pay_id) VALUES
('232370e9-045e-4269-96ec-5a79091d65ff', 'alice$127.0.0.1'),
('223ece9c-2a15-48e1-9df6-d9ac77c5db90', 'bob$127.0.0.1'),
('ec06236e-d134-4a7b-b69e-0606fb54b67b', 'alice$xpring.money'),
('69b0d20a-cdef-4bb9-adf9-2109979a12af', 'bob$xpring.money'),
('b253bed2-79ce-45d0-bbdd-96867aa85fd5', 'zebra$xpring.money'),
('8a75f884-ab16-40c4-a82a-aca454dad6b2', 'empty$xpring.money');

/* Verified Accounts */
INSERT INTO account(id, pay_id, identity_key) VALUES
('27944333-faf6-41e8-90c3-1ec9001f0830', 'emptyverified$127.0.0.1', ''),
('9a75f884-ab16-40c4-a82a-aca454dad6b2', 'verifiabledemo$127.0.0.1', 'eyJuYW1lIjoiaWRlbnRpdHlLZXkiLCJhbGciOiJFUzI1NksiLCJ0eXAiOiJKT1NFK0pTT04iLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCIsIm5hbWUiXSwiandrIjp7ImNydiI6InNlY3AyNTZrMSIsIngiOiI2S0dtcEF6WUhWUm9qVmU5UEpfWTVyZHltQ21kTy1xaVRHem1Edl9waUlvIiwieSI6ImhxS3Vnc1g3Vjk3eFRNLThCMTBONUQxcW44MUZWMjItM1p0TURXaXZfSnciLCJrdHkiOiJFQyIsImtpZCI6Im4zNlhTc0M1TjRnNUtCVzRBWXJ5d1ZtRE1kUWNEV1BJX0RfNUR1UlNhNDAifX0'),
('2955cce9-c350-4b60-9726-c415072961ed', 'verified$127.0.0.1', 'bGV0IG1lIHNlZSB0aGVtIGNvcmdpcyBOT1cgb3IgcGF5IHRoZSBwcmljZQ=='),
('67d9ad5f-5cd8-4a0c-b642-70e63354e647', 'postmalone$127.0.0.1', 'aGkgbXkgbmFtZSBpcyBhdXN0aW4gYW5kIEkgYW0gdGVzdGluZyB0aGluZ3M='),
('35192b90-9b88-4137-85c9-3d1d3d92cf2c', 'johnwick$127.0.0.1', 'aGV0IG1lIHNlZSB0aGVtIGNvcmdpcyBOT1cgb3IgcGF5IHRoZSBwcmljZQ=='),
('772d5315-988a-4509-be15-3b535c870555', 'donaldduck$127.0.0.1', 'aGVyIGVpIGFtIGxvb2tpbmcgb3V0IHRoZSB3aW5kb3cgYW5kIGEgbWYgY3JhbmUgYXBwZWFycw=='),
('bc041012-7385-4904-8bc9-57219c0bf290', 'nextversion$127.0.0.1', 'd2VpcmQgYWwgeWFrbm9jaWYgc2hvdWxkIHJ1biBmb3IgcHJlc2lkZW50ZQ==');

/* Unverified Addresses */
INSERT INTO address(account_id, payment_network, environment, details) VALUES
('232370e9-045e-4269-96ec-5a79091d65ff', 'XRPL', 'MAINNET', '{"address": "rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg", "tag": "67298042"}'),
('232370e9-045e-4269-96ec-5a79091d65ff', 'XRPL', 'TESTNET', '{"address": "rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS"}'),
('232370e9-045e-4269-96ec-5a79091d65ff', 'BTC',  'TESTNET', '{"address": "mxNEbRXokcdJtT6sbukr1CTGVx8Tkxk3DB"}'),
('232370e9-045e-4269-96ec-5a79091d65ff', 'ACH',   NULL,     '{"accountNumber": "000123456789", "routingNumber": "123456789"}'),
('223ece9c-2a15-48e1-9df6-d9ac77c5db90', 'XRPL', 'TESTNET', '{"address": "rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS"}'),
('ec06236e-d134-4a7b-b69e-0606fb54b67b', 'XRPL', 'TESTNET', '{"address": "rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS"}'),
('69b0d20a-cdef-4bb9-adf9-2109979a12af', 'XRPL', 'TESTNET', '{"address": "rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS"}'),
('35192b90-9b88-4137-85c9-3d1d3d92cf2c', 'BTC',  'MAINNET', '{"address": "2NGZrVvZG92qGYqzTLjCAewvPZ7JE8S8VxE"}'),
('b253bed2-79ce-45d0-bbdd-96867aa85fd5', 'INTERLEDGER', 'TESTNET', '{"address": "$xpring.money/zebra"}'),
('bc041012-7385-4904-8bc9-57219c0bf290', 'BTC', 'TESTNET', '{"address": "mnBgkgCvqC3JeB5akfjAFik8qSG74r39dHJ"}');

/* Verified Addresses */
INSERT INTO address(account_id, payment_network, environment, details, identity_key_signature) VALUES
('9a75f884-ab16-40c4-a82a-aca454dad6b2', 'XRPL', 'TESTNET', '{"address": "rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS"}', 'rsoKeVLzwg2PpGRK0S10fpmh5WNtttF9dyJgSv3USEr4aN3bUBzp5ImRQo8wlh3E00GtZ2cse-lhoQ4zJKj0Jw'),
('67d9ad5f-5cd8-4a0c-b642-70e63354e647', 'BTC', 'TESTNET', '{"address": "2NGZrVvZG92qGYqzTLjCAewvPZ7JE8S8VxE"}', 'TG9vayBhdCBtZSEgd29vIEknbSB0ZXN0aW5nIHRoaW5ncyBhbmQgdGhpcyBpcyBhIHNpZ25hdHVyZQ=='),
('35192b90-9b88-4137-85c9-3d1d3d92cf2c', 'BTC', 'TESTNET', '{"address": "2NGZrVvZG92qGYqzTLjCAewvPZ7JE8S8VxE"}', 'TG9vayBhdCBtZSEgd29vIEknbSB0ZXN0aW5nIHRoaW5ncyBhbmQgdGhpcyBpcyBhIHNpZ25hdHVyZQ=='),
('35192b90-9b88-4137-85c9-3d1d3d92cf2c', 'XRPL', 'TESTNET', '{"address": "rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS"}', 'TG9vayBhdCBtZSEgd29vIEknbSB0ZXN0aW5nIHRoaW5ncyBhbmQgdGhpcyBpcyBhIHNpZ25hdHVyZQ=='),
('35192b90-9b88-4137-85c9-3d1d3d92cf2c', 'XRPL', 'MAINNET', '{"address": "rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS"}', 'TG9vayBhdCBtZSEgd29vIEknbSB0ZXN0aW5nIHRoaW5ncyBhbmQgdGhpcyBpcyBhIHNpZ25hdHVyZQ=='),
('35192b90-9b88-4137-85c9-3d1d3d92cf2c', 'ACH',   NULL,     '{"accountNumber": "000123456789", "routingNumber": "123456789"}', 'TG9vayBhdCBtZSEgd29vIEknbSB0ZXN0aW5nIHRoaW5ncyBhbmQgdGhpcyBpcyBhIHNpZ25hdHVyZQ=='),
('772d5315-988a-4509-be15-3b535c870555', 'XRPL', 'MAINNET', '{"address": "rU5KBPzSyPycRVW1HdgCKjYpU6W9PKQdE8"}', 'YW5kIGFsbCBvZiBhIHN1ZGRlbiBpdCBzdGFydHMgcnVubmluZyBhdCBtZSBzbyBJIGZsaXAhIGNvbGEK'),
('bc041012-7385-4904-8bc9-57219c0bf290', 'XRPL', 'MAINNET', '{"address": "rM19Xw44JvpC6fL2ioAZRuH6mpuwxcPqsu"}', 'YnV0IHdoYXQgaWYgaXQgd3MgdGhlIHBpZ2VvbnMgYWxsIGFsb25nIGluIHRoZSBjdWJwYXJzZHM=');

END TRANSACTION;
