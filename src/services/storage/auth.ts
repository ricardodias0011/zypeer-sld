import type { UserProps } from "../../types/user";
import { locales_storage } from "../../utils/storage";

const UserStorage = {
  getUserStorage(): UserProps | null {
    if (localStorage.getItem(locales_storage.StorageUser)) {
      return JSON.parse(localStorage.getItem(locales_storage.StorageUser) ?? '');
    }
    return null
  },

  saveUserStorage(user: UserProps) {
    localStorage.setItem(locales_storage.StorageUser, JSON.stringify(user));
  },
  saveTempToken(token: string) {
    localStorage.setItem(locales_storage.StorageTempToken, JSON.stringify(token));
  },
  getTempToken(): string | null {
    const token = localStorage.getItem(locales_storage.StorageTempToken);
    return token ? token.replace(/^"|"$/g, '') : null;
  },
  saveTokenStorage(token: { access_token: string; refresh_token: string }) {
    localStorage.setItem(locales_storage.StorageToken, JSON.stringify(token));
  },

  getTokenStorage(): { access_token: string; refresh_token: string } | null {
    if (localStorage.getItem(locales_storage.StorageToken)) {
      return JSON.parse(localStorage.getItem(locales_storage.StorageToken) ?? '');
    }
    return null
  },

  removeTokensAuth() {
    localStorage.removeItem(locales_storage.StorageUser)
    localStorage.removeItem(locales_storage.StorageToken)
  }
}

export default UserStorage;