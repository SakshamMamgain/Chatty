import SimpleCrypto from "simple-crypto-js";

export function encryptMessage(message: string, password: string): string {
  const crypto = new SimpleCrypto(password);
  return crypto.encrypt(message);
}

export function decryptMessage(encryptedMessage: string, password: string): string {
  try {
    const crypto = new SimpleCrypto(password);
    return crypto.decrypt(encryptedMessage);
  } catch (err) {
    return "[Unable to decrypt message]";
  }
}
