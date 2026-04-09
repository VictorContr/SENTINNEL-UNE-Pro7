import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * SENTINNEL – Encryption Utility
 * Provides AES-256-GCM encryption for session data
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derives a 32-byte key from the environment variable
 * Uses simple byte-array approach (same as frontend for compatibility)
 */
function getKey(): Buffer {
  const envKey = process.env.SESSION_ENCRYPTION_KEY;
  if (!envKey) {
    throw new Error('SESSION_ENCRYPTION_KEY not configured');
  }
  // Simple key derivation: encode string and pad/truncate to 32 bytes
  // This matches the frontend implementation exactly
  const keyBytes = Buffer.alloc(KEY_LENGTH);
  const envKeyBytes = Buffer.from(envKey, 'utf-8');
  for (let i = 0; i < KEY_LENGTH; i++) {
    keyBytes[i] = envKeyBytes[i % envKeyBytes.length];
  }
  return keyBytes;
}

/**
 * Encrypts a string using AES-256-GCM
 * Returns: base64(iv:authTag:ciphertext)
 */
export function encrypt_sm_vc(text: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Combine: iv + authTag + ciphertext
  const result = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]);
  return result.toString('base64');
}

/**
 * Decrypts a string encrypted with encrypt_sm_vc
 * Input: base64(iv:authTag:ciphertext)
 */
export function decrypt_sm_vc(encryptedBase64: string): string {
  const key = getKey();
  const data = Buffer.from(encryptedBase64, 'base64');

  // Extract components
  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext.toString('hex'), 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Encrypts a session object (user + token)
 */
export function encryptSession_sm_vc(session: {
  user: any;
  token: string;
}): string {
  return encrypt_sm_vc(JSON.stringify(session));
}

/**
 * Decrypts a session string back to object
 */
export function decryptSession_sm_vc(encryptedSession: string): {
  user: any;
  token: string;
} {
  const decrypted = decrypt_sm_vc(encryptedSession);
  return JSON.parse(decrypted);
}
