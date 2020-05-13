import {
  SignatureWrapper,
  Invoice,
  MessageType,
  Compliance,
  PaymentProof,
} from '../types/publicAPI'

export type MessageWithType =
  | [Invoice, MessageType.Invoice]
  | [Compliance, MessageType.Compliance]
  | [PaymentProof, MessageType.PaymentProof]

export function wrapMessage(...args: MessageWithType): SignatureWrapper {
  return {
    messageType: args[1],
    message: args[0],
    publicKeyType: 'x509+sha256',
    publicKeyData: [],
    publicKey: `00:c9:22:69:31:8a:d6:6c:ea:da:c3:7f:2c:ac:a5:af:c0:02:ea:81:cb:65:b9:fd:0c:6d:46:5b:c9:1e:9d:3b:ef`,
    signature: `8b:c3:ed:d1:9d:39:6f:af:40:72:bd:1e:18:5e:30:54:23:35...`,
  }
}
