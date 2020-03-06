TRUNCATE account, address;

INSERT INTO account(id, payment_pointer, organization) VALUES
('14d11504-6aac-4a37-b011-65cbfd3536fd', 'https://xpring.io/hansbergren', 'xpring'),
('4ac535f7-140f-4ed5-bbb0-ffc2e6149f73', 'https://stage.xpring.io/hansbergren', 'xpring'),
('223ece9c-2a15-48e1-9df6-d9ac77c5db90', 'https://xpring.money/hansbergren', 'xpring'),
('69b0d20a-cdef-4bb9-adf9-2109979a12af', 'https://stage.xpring.money/hansbergren', 'xpring');
('fdf31991-f5ea-483b-b690-c01cd4a4105b', 'https://xpring.io/hbergren', 'xpring'),
('0330261c-c372-4a1d-946c-9a2f6966d2f8', 'https://stage.xpring.io/hbergren', 'xpring'),
('232370e9-045e-4269-96ec-5a79091d65ff', 'https://xpring.money/hbergren', 'xpring'),
('ec06236e-d134-4a7b-b69e-0606fb54b67b', 'https://stage.xpring.money/hbergren', 'xpring');


INSERT INTO address(account_id, currency, network, payment_information) VALUES
('14d11504-6aac-4a37-b011-65cbfd3536fd', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('4ac535f7-140f-4ed5-bbb0-ffc2e6149f73', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('223ece9c-2a15-48e1-9df6-d9ac77c5db90', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('69b0d20a-cdef-4bb9-adf9-2109979a12af', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('fdf31991-f5ea-483b-b690-c01cd4a4105b', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('0330261c-c372-4a1d-946c-9a2f6966d2f8', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('232370e9-045e-4269-96ec-5a79091d65ff', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('ec06236e-d134-4a7b-b69e-0606fb54b67b', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}');
