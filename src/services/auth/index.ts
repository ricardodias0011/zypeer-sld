import api from "../api";

export class AuthService {
  static async me() {
    return api.get(`/auth/me`);
  }
}