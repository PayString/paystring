## Travel rule example

In this tutorial, we'll be walking through the travel rule handshake protocol

We'll start off by creating a user:
```
curl --location --request POST http://localhost:8081/v1/users --header 'Content-Type: application/json' --data-raw '{
  "pay_id": "$127.0.0.1/exampleUser",
  "addresses": [
  {
    "payment_network": "XRPL",
    "environment": "TESTNET",
    "details": {
      "address": "TVnGpXXZZ3xAZfhT42ntuCR4Uh3Rv9LE4BcZJeH1zds2CQ2"
    }
  }
  ]
}'
```

Now that we've created a user, we can query their payment information through the public API:
```
curl --location --request GET 'http://127.0.0.1:8080/exampleUser' --header 'Accept: application/xrpl-testnet+json'
```

We've confirmed that our PayID is working as expected so let's send an invoice request:
```
curl --location --request GET 'http://127.0.0.1:8080/exampleUser/invoice?nonce=123456' \
--header 'Accept: application/xrpl-testnet+json' \
--header 'Content-Type: application/json'
```

The returned JSON object is our payment invoice. In this example, the institution is a VASP and has listed any laws that must be complied with in the `complianceRequirements` field of the invoice. Specifically, as the originator of the payment we are being asked to comply with the Travel Rule. In order to do that, we'll POST the compliance data to the same URL in order to upgrade our invoice.
```
curl --location --request POST 'http://127.0.0.1:8080/exampleUser/invoice?nonce=123456' \
--header 'Content-Type: application/json' \
--data-raw '{
        "messageType": "compliance",
        "message": {
                "type": "TravelRule",
                "data": {
                        "originator": {
                                "userLegalName": "Theodore Kalaw",
                                "accountId": "ef841530-f476-429c-b8f3-de25a0a29f80 ",
                                "userPhysicalAddress": "520 Main Street",
                                "institutionName": "xpring",
                                "value": {
                                        "amount": "100",
                                        "scale": 1
                                },
                                "timestamp": "1586361979654"
                        },
                        "beneficiary": {
                                "institutionName": "xpring"
                        }

                }
        },
        "pkiType": "x509+sha256",
        "pkiData": [],
        "publicKey": "00:c9:22:69:31:8a:d6:6c:ea:da:c3:7f:2c:ac:a5:\n    af:c0:02:ea:81:cb:65:b9:fd:0c:6d:46:5b:c9:1e:\n    9d:3b:ef",
        "signature": "8b:c3:ed:d1:9d:39:6f:af:40:72:bd:1e:18:5e:30:54:23:35..."
}'
```

Upon submission of this data, the beneficiary should identify that we have fulfilled all compliance requirements and send us an upgraded invoice. This upgraded invoice cryptographically correlates our submission of compliance data through the complianceHashes field. Now that we have been informed of all compliance requirements, and fulfilled them, we can submit our transaction on ledger and POST back the receipt of payment.
```
curl --location --request POST 'http://127.0.0.1:8080/exampleUser/receipt' \
--header 'Content-Type: application/json' \
--data-raw '{
  "invoiceHash": "8743b52063cd84097a65d1633f5c74f5",
  "transactionConfirmation": "797A887A269FEAFFEC446389DC1BB8C0DFBF9421C2FA72CA244AA5EB027008FC"
}'
```

Congrats, you just sent your first travel rule compliant payment!
