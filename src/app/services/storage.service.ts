import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StorageService {

  private secret = environment.storageSecret;

  set(key: string, value: unknown): void {
    const json      = JSON.stringify(value);
    const encrypted = CryptoJS.AES.encrypt(json, this.secret).toString();
    localStorage.setItem(key, encrypted);
  }

  get<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    // ── Try AES decrypt (new encrypted format) ──────────────────────────────
    try {
      const bytes = CryptoJS.AES.decrypt(raw, this.secret);
      const json  = bytes.toString(CryptoJS.enc.Utf8);
      if (json) {
        return JSON.parse(json) as T;
      }
    } catch { /* fall through to migration */ }

    // ── Migration: old plain-text value detected ─────────────────────────────
    // Re-encrypt it so future reads work, then return the plain value.
    try {
      // Old token was stored as raw string (JWT). Old user was stored as JSON string.
      const parsed = JSON.parse(raw) as T;     // old user object
      this.set(key, parsed);                    // re-encrypt
      return parsed;
    } catch {
      // Raw string that is not JSON (e.g. old plain JWT token)
      this.set(key, raw as unknown as T);       // re-encrypt the raw string
      return raw as unknown as T;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
