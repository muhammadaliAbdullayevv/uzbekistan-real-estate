import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const CURRENT_PARAMS = { N: 32768, r: 8, p: 1 };
// Node requires maxmem to comfortably exceed ~128 * N * r bytes.
const SCRYPT_MAXMEM = 64 * 1024 * 1024;

// Legacy hashes (created before cost params were made explicit) used Node's
// implicit scrypt defaults: N=16384, r=8, p=1.
const LEGACY_PARAMS = { N: 16384, r: 8, p: 1 };

function deriveKey(
  password: string,
  salt: string,
  params: { N: number; r: number; p: number }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(
      password,
      salt,
      KEY_LENGTH,
      { N: params.N, r: params.r, p: params.p, maxmem: SCRYPT_MAXMEM },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(derivedKey);
      }
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await deriveKey(password, salt, CURRENT_PARAMS);

  return `scrypt:${CURRENT_PARAMS.N}:${CURRENT_PARAMS.r}:${CURRENT_PARAMS.p}:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash?: string | null
): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (!storedHash) {
    return { valid: false, needsRehash: false };
  }

  let params: { N: number; r: number; p: number };
  let salt: string | undefined;
  let key: string | undefined;
  let needsRehash: boolean;

  if (storedHash.startsWith("scrypt:")) {
    const parts = storedHash.split(":");
    const [, nRaw, rRaw, pRaw, saltPart, keyPart] = parts;
    const N = Number(nRaw);
    const r = Number(rRaw);
    const p = Number(pRaw);

    if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p) || !saltPart || !keyPart) {
      return { valid: false, needsRehash: false };
    }

    params = { N, r, p };
    salt = saltPart;
    key = keyPart;
    needsRehash =
      N !== CURRENT_PARAMS.N || r !== CURRENT_PARAMS.r || p !== CURRENT_PARAMS.p;
  } else {
    const [saltPart, keyPart] = storedHash.split(":");
    params = LEGACY_PARAMS;
    salt = saltPart;
    key = keyPart;
    needsRehash = true;
  }

  if (!salt || !key) {
    return { valid: false, needsRehash: false };
  }

  const derivedKey = await deriveKey(password, salt, params);
  const keyBuffer = Buffer.from(key, "hex");

  if (derivedKey.length !== keyBuffer.length) {
    return { valid: false, needsRehash: false };
  }

  const valid = timingSafeEqual(derivedKey, keyBuffer);

  return { valid, needsRehash: valid && needsRehash };
}
