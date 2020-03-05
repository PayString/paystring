TRUNCATE account, address;

INSERT INTO account(id, payment_pointer, organization)
VALUES('14d11504-6aac-4a37-b011-65cbfd3536fd', 'https://xpring.io/hansbergren', 'xpring');

INSERT INTO address(account_id, currency, network, payment_information)
values ('14d11504-6aac-4a37-b011-65cbfd3536fd', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}');
