/**
 * SENTINNEL – Crypto Store
 * Store de Pinia para operaciones de cifrado/descifrado AES-256-GCM.
 *
 * Funcionalidad original de: src/utils/crypto.js
 * Adaptado a store para mantener consistencia arquitectónica.
 */

import { defineStore } from "pinia";

const ALGORITHM = "AES-GCM";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export const useCryptoStore = defineStore("crypto", () => {
  /**
   * Deriva una CryptoKey desde la variable de entorno.
   * Misma implementación que el utilitario original.
   */
  async function getCryptoKey() {
    const keyString = process.env.SESSION_ENCRYPTION_KEY;
    if (!keyString) {
      throw new Error("SESSION_ENCRYPTION_KEY not configured");
    }

    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyString);
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
   * Descifra una sesión encriptada por el backend.
   * Input: base64(iv:authTag:ciphertext)
   * Output: { user, token }
   */
  async function decryptSession_sm_vc(encryptedBase64) {
    const key = await getCryptoKey();

    const data = Uint8Array.from(atob(encryptedBase64), (c) =>
      c.charCodeAt(0),
    );

    const iv = data.slice(0, IV_LENGTH);
    const authTag = data.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = data.slice(IV_LENGTH + AUTH_TAG_LENGTH);

    const encryptedData = new Uint8Array(ciphertext.length + authTag.length);
    encryptedData.set(ciphertext, 0);
    encryptedData.set(authTag, ciphertext.length);

    try {
      const decrypted = await crypto.subtle.decrypt(
        {
          name: ALGORITHM,
          iv: iv,
          tagLength: AUTH_TAG_LENGTH * 8,
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
   * Encripta un objeto de sesión.
   * Returns: base64(iv:authTag:ciphertext)
   */
  async function encryptSession_sm_vc(session) {
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

    const encryptedArray = new Uint8Array(encrypted);
    const ciphertext = encryptedArray.slice(0, -AUTH_TAG_LENGTH);
    const authTag = encryptedArray.slice(-AUTH_TAG_LENGTH);

    const result = new Uint8Array(
      IV_LENGTH + AUTH_TAG_LENGTH + ciphertext.length,
    );
    result.set(iv, 0);
    result.set(authTag, IV_LENGTH);
    result.set(ciphertext, IV_LENGTH + AUTH_TAG_LENGTH);

    return btoa(String.fromCharCode(...result));
  }

  return {
    decryptSession_sm_vc,
    encryptSession_sm_vc,
    // Legacy: mantener compatibilidad con código que espera la función getCryptoKey
    getCryptoKey,
  };
});

// ══════════════════════════════════════════════════════════════════
// EXPORTS DIRECTOS (compatibilidad con código existente)
// ══════════════════════════════════════════════════════════════════
// Mantenemos las exportaciones independientes para no romper imports existentes.
// En código nuevo, preferir: import { useCryptoStore } from 'stores/cryptoStore'

const ALGORITHM_EXPORT = "AES-GCM";
const IV_LENGTH_EXPORT = 16;
const AUTH_TAG_LENGTH_EXPORT = 16;
const KEY_LENGTH_EXPORT = 32;

async function getCryptoKey_export() {
  const keyString = process.env.SESSION_ENCRYPTION_KEY;
  if (!keyString) {
    throw new Error("SESSION_ENCRYPTION_KEY not configured");
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyString);
  const keyBytes = new Uint8Array(KEY_LENGTH_EXPORT);

  for (let i = 0; i < KEY_LENGTH_EXPORT; i++) {
    keyBytes[i] = keyData[i % keyData.length];
  }

  return await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: ALGORITHM_EXPORT },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function decryptSession_sm_vc(encryptedBase64) {
  const key = await getCryptoKey_export();

  const data = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
  const iv = data.slice(0, IV_LENGTH_EXPORT);
  const authTag = data.slice(IV_LENGTH_EXPORT, IV_LENGTH_EXPORT + AUTH_TAG_LENGTH_EXPORT);
  const ciphertext = data.slice(IV_LENGTH_EXPORT + AUTH_TAG_LENGTH_EXPORT);

  const encryptedData = new Uint8Array(ciphertext.length + authTag.length);
  encryptedData.set(ciphertext, 0);
  encryptedData.set(authTag, ciphertext.length);

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM_EXPORT,
        iv: iv,
        tagLength: AUTH_TAG_LENGTH_EXPORT * 8,
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

export async function encryptSession_sm_vc(session) {
  const key = await getCryptoKey_export();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_EXPORT));

  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(session));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: ALGORITHM_EXPORT,
      iv: iv,
      tagLength: AUTH_TAG_LENGTH_EXPORT * 8,
    },
    key,
    data,
  );

  const encryptedArray = new Uint8Array(encrypted);
  const ciphertext = encryptedArray.slice(0, -AUTH_TAG_LENGTH_EXPORT);
  const authTag = encryptedArray.slice(-AUTH_TAG_LENGTH_EXPORT);

  const result = new Uint8Array(
    IV_LENGTH_EXPORT + AUTH_TAG_LENGTH_EXPORT + ciphertext.length,
  );
  result.set(iv, 0);
  result.set(authTag, IV_LENGTH_EXPORT);
  result.set(ciphertext, IV_LENGTH_EXPORT + AUTH_TAG_LENGTH_EXPORT);

  return btoa(String.fromCharCode(...result));
}
