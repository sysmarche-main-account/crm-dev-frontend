import crypto from "crypto";

// const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "abcdefghijklmnopqrstuvwx"; // 32 chars
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY; // 32 chars
const ALGORITHM = "aes-256-cbc";

// Encrypt
export function encrypt(data) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted.toString("hex"),
  };
}

// Decrypt function (server-side only)
export function decrypt(iv, encryptedData) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(Buffer.from(encryptedData, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
}
