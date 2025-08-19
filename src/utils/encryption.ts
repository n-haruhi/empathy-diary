import CryptoJS from 'crypto-js';

// パスワードからキーを派生
function deriveKey(password: string, salt: string): string {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000
  }).toString();
}

// データを暗号化
export function encryptData(data: string, password: string): string {
  const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
  const key = deriveKey(password, salt);
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.GCM
  });
  
  return JSON.stringify({
    salt,
    iv: iv.toString(),
    data: encrypted.toString()
  });
}

// データを復号化
export function decryptData(encryptedData: string, password: string): string {
  try {
    const { salt, iv, data } = JSON.parse(encryptedData);
    const key = deriveKey(password, salt);
    
    const decrypted = CryptoJS.AES.decrypt(data, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.GCM
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error('復号化に失敗しました');
  }
}
