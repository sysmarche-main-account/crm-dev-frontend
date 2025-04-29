import CryptoJS from "crypto-js";

// Client-side decrypt function
export function decryptClient(iv, encryptedData, key) {
  const keyHex = CryptoJS.enc.Utf8.parse(key);
  const ivHex = CryptoJS.enc.Hex.parse(iv);
  const encryptedHex = CryptoJS.enc.Hex.parse(encryptedData);

  const decrypted = CryptoJS.AES.decrypt({ ciphertext: encryptedHex }, keyHex, {
    iv: ivHex,
    mode: CryptoJS.mode.CBC,
  });

  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}
