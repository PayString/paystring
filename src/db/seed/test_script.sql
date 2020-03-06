TRUNCATE account, address;

-- Hans Seeds
INSERT INTO account(id, payment_pointer, organization) VALUES
('14d11504-6aac-4a37-b011-65cbfd3536fd', 'https://xpring.io/hansbergren', 'xpring'),
('4ac535f7-140f-4ed5-bbb0-ffc2e6149f73', 'https://stage.xpring.io/hansbergren', 'xpring'),
('223ece9c-2a15-48e1-9df6-d9ac77c5db90', 'https://xpring.money/hansbergren', 'xpring'),
('69b0d20a-cdef-4bb9-adf9-2109979a12af', 'https://stage.xpring.money/hansbergren', 'xpring'),
('fdf31991-f5ea-483b-b690-c01cd4a4105b', 'https://xpring.io/hbergren', 'xpring'),
('0330261c-c372-4a1d-946c-9a2f6966d2f8', 'https://stage.xpring.io/hbergren', 'xpring'),
('232370e9-045e-4269-96ec-5a79091d65ff', 'https://xpring.money/hbergren', 'xpring'),
('ec06236e-d134-4a7b-b69e-0606fb54b67b', 'https://stage.xpring.money/hbergren', 'xpring'),
('f5c1594b-58eb-43ee-a08e-182836976bda', 'https://payid-dev2.xpring.io/hbergren', 'xpring'),
('29718b39-ef7e-4aab-8d1a-e9d5090adbb9', 'https://payid-dev2.xpring.io/hansbergren', 'xpring');

INSERT INTO address(account_id, currency, network, payment_information) VALUES
('14d11504-6aac-4a37-b011-65cbfd3536fd', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('4ac535f7-140f-4ed5-bbb0-ffc2e6149f73', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('223ece9c-2a15-48e1-9df6-d9ac77c5db90', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('69b0d20a-cdef-4bb9-adf9-2109979a12af', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('fdf31991-f5ea-483b-b690-c01cd4a4105b', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('0330261c-c372-4a1d-946c-9a2f6966d2f8', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('232370e9-045e-4269-96ec-5a79091d65ff', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('ec06236e-d134-4a7b-b69e-0606fb54b67b', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('f5c1594b-58eb-43ee-a08e-182836976bda', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}'),
('29718b39-ef7e-4aab-8d1a-e9d5090adbb9', 'XRP', 'TESTNET', '{"xAddress": "T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW", "classicAddress": "rsGDoRqqefkvWtznKe7bHH6HtmjnJwQvWK"}');


-- Austin Seeds
INSERT INTO account(id, payment_pointer, organization) VALUES
('1dab88a3-add6-4809-bd14-8c609db51b26', 'https://xpring.io/austin-king', 'xpring'),
('b534da95-6e72-4db2-a8a7-bf232835aff4', 'https://stage.xpring.io/austin-king', 'xpring'),
('28b5e205-f1e1-4ca7-8d38-1f9928319e65', 'https://xpring.money/austin-king', 'xpring'),
('c8947381-4ab2-4f81-bc69-bbdd96c0a3f9', 'https://stage.xpring.money/austin-king', 'xpring'),
('bea3d0c8-795a-4dac-b1b1-bb193dbc9c40', 'https://payid-dev2.xpring.io/austin-king', 'xpring'),
('04a6122a-d696-47aa-8ccd-f045751ff3c9', 'https://payid-prd.xpring.io/austin-king', 'xpring'),
('5bc7988f-22c5-4f43-bcf4-0eb8be234197', 'https://xpring.io/aking', 'xpring'),
('828b3b6d-328f-4823-a42c-fde06ece2294', 'https://stage.xpring.io/aking', 'xpring'),
('84ed3f31-773d-4524-8dc3-d428d1f44562', 'https://xpring.money/aking', 'xpring'),
('bd740bd7-e3d3-43e9-a759-9db4b5dd292d', 'https://stage.xpring.money/aking', 'xpring'),
('84ca66e5-0224-4267-bc0d-89666f2464f3', 'https://payid-dev2.xpring.io/aking', 'xpring'),
('73a46a25-2a87-4d16-bc3f-6fa88dac6027', 'https://payid-prd.xpring.io/aking', 'xpring');

INSERT INTO address(account_id, currency, network, payment_information) VALUES
('1dab88a3-add6-4809-bd14-8c609db51b26', 'XRP', 'TESTNET', '{"xAddress": "TVJhoLuDLMu63kxf5ADWoQ4UhMGeYt84kKDMiYUAnquL5D2", "classicAddress": "rHGN7AsqPpo3sk5Py9TsJT1bAtzyomArM4"}'),
('b534da95-6e72-4db2-a8a7-bf232835aff4', 'XRP', 'TESTNET', '{"xAddress": "TVJhoLuDLMu63kxf5ADWoQ4UhMGeYt84kKDMiYUAnquL5D2", "classicAddress": "rHGN7AsqPpo3sk5Py9TsJT1bAtzyomArM4"}'),
('28b5e205-f1e1-4ca7-8d38-1f9928319e65', 'XRP', 'TESTNET', '{"xAddress": "TVJhoLuDLMu63kxf5ADWoQ4UhMGeYt84kKDMiYUAnquL5D2", "classicAddress": "rHGN7AsqPpo3sk5Py9TsJT1bAtzyomArM4"}'),
('c8947381-4ab2-4f81-bc69-bbdd96c0a3f9', 'XRP', 'TESTNET', '{"xAddress": "TVJhoLuDLMu63kxf5ADWoQ4UhMGeYt84kKDMiYUAnquL5D2", "classicAddress": "rHGN7AsqPpo3sk5Py9TsJT1bAtzyomArM4"}'),
('5bc7988f-22c5-4f43-bcf4-0eb8be234197', 'XRP', 'TESTNET', '{"xAddress": "TVJhoLuDLMu63kxf5ADWoQ4UhMGeYt84kKDMiYUAnquL5D2", "classicAddress": "rHGN7AsqPpo3sk5Py9TsJT1bAtzyomArM4"}'),
('828b3b6d-328f-4823-a42c-fde06ece2294', 'XRP', 'TESTNET', '{"xAddress": "TVJhoLuDLMu63kxf5ADWoQ4UhMGeYt84kKDMiYUAnquL5D2", "classicAddress": "rHGN7AsqPpo3sk5Py9TsJT1bAtzyomArM4"}'),
('84ed3f31-773d-4524-8dc3-d428d1f44562', 'XRP', 'TESTNET', '{"xAddress": "TVJhoLuDLMu63kxf5ADWoQ4UhMGeYt84kKDMiYUAnquL5D2", "classicAddress": "rHGN7AsqPpo3sk5Py9TsJT1bAtzyomArM4"}'),
('bd740bd7-e3d3-43e9-a759-9db4b5dd292d', 'XRP', 'TESTNET', '{"xAddress": "TVJhoLuDLMu63kxf5ADWoQ4UhMGeYt84kKDMiYUAnquL5D2", "classicAddress": "rHGN7AsqPpo3sk5Py9TsJT1bAtzyomArM4"}'),
('bea3d0c8-795a-4dac-b1b1-bb193dbc9c40', 'XRP', 'TESTNET', '{"xAddress": "TVJhoLuDLMu63kxf5ADWoQ4UhMGeYt84kKDMiYUAnquL5D2", "classicAddress": "rHGN7AsqPpo3sk5Py9TsJT1bAtzyomArM4"}'),
('73a46a25-2a87-4d16-bc3f-6fa88dac6027', 'XRP', 'TESTNET', '{"xAddress": "TVJhoLuDLMu63kxf5ADWoQ4UhMGeYt84kKDMiYUAnquL5D2", "classicAddress": "rHGN7AsqPpo3sk5Py9TsJT1bAtzyomArM4"}'),
('04a6122a-d696-47aa-8ccd-f045751ff3c9', 'XRP', 'TESTNET', '{"xAddress": "TVJhoLuDLMu63kxf5ADWoQ4UhMGeYt84kKDMiYUAnquL5D2", "classicAddress": "rHGN7AsqPpo3sk5Py9TsJT1bAtzyomArM4"}'),
('84ca66e5-0224-4267-bc0d-89666f2464f3', 'XRP', 'TESTNET', '{"xAddress": "TVJhoLuDLMu63kxf5ADWoQ4UhMGeYt84kKDMiYUAnquL5D2", "classicAddress": "rHGN7AsqPpo3sk5Py9TsJT1bAtzyomArM4"}');
