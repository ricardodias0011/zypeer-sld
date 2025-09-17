import api from "../api";

export class AssetsService {
  static async list() {
    return api.get(`/upload/`);
  }

  static async upload(data: File, type: "assets" | "thumbnail" | "ebooks" | "avatar", replace?: string) {
    const file = new FormData()
    file.append('file', data)
    return api.post(`/upload/${type}`, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        replace
      }
    });
  }

}