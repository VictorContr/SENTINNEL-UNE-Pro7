/**
 * SENTINNEL – Frontend Crypto Utility
 * Provides AES-256-GCM encryption/decryption compatible with backend
 */

const ALGORITHM = "AES-GCM";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derives a CryptoKey from the encryption key string
 * Uses the same scrypt-based approach as backend (simplified for browser)
 */
async function getCryptoKey() {
  const keyString = process.env.SESSION_ENCRYPTION_KEY;
  if (!keyString) {
    throw new Error("SESSION_ENCRYPTION_KEY not configured");
  }

  // Simple key derivation: encode string and pad/truncate to 32 bytes
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyString);

  // Create a 32-byte array
  const keyBytes = new Uint8Array(KEY_LENGTH);
  for (let i = 0; i < KEY_LENGTH; i++) {
    keyBytes[i] = keyData[i % keyData.length];
  }

  return await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: ALGORITHM },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Decrypts a session string encrypted by the backend
 * Input: base64(iv:authTag:ciphertext)
 * Output: { user, token }
 */
export async function decryptSession_sm_vc(encryptedBase64) {
  const key = await getCryptoKey();

  // Decode base64
  const data = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));

  // Extract components
  const iv = data.slice(0, IV_LENGTH);
  const authTag = data.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = data.slice(IV_LENGTH + AUTH_TAG_LENGTH);

  // Combine ciphertext + authTag for Web Crypto API
  const encryptedData = new Uint8Array(ciphertext.length + authTag.length);
  encryptedData.set(ciphertext, 0);
  encryptedData.set(authTag, ciphertext.length);

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
        tagLength: AUTH_TAG_LENGTH * 8, // in bits
      },
      key,
      encryptedData,
    );

    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decrypted);
    return JSON.parse(decryptedText);
  } catch (error) {
    throw new Error("Failed to decrypt session: " + error.message);
  }
}

/**
 * Encrypts a session object (for storing updated session data)
 * Returns: base64(iv:authTag:ciphertext)
 */
export async function encryptSession_sm_vc(session) {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(session));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv,
      tagLength: AUTH_TAG_LENGTH * 8,
    },
    key,
    data,
  );

  // Extract ciphertext and authTag
  const encryptedArray = new Uint8Array(encrypted);
  const ciphertext = encryptedArray.slice(0, -AUTH_TAG_LENGTH);
  const authTag = encryptedArray.slice(-AUTH_TAG_LENGTH);

  // Combine: iv + authTag + ciphertext
  const result = new Uint8Array(
    IV_LENGTH + AUTH_TAG_LENGTH + ciphertext.length,
  );
  result.set(iv, 0);
  result.set(authTag, IV_LENGTH);
  result.set(ciphertext, IV_LENGTH + AUTH_TAG_LENGTH);

  // Convert to base64
  return btoa(String.fromCharCode(...result));
}
