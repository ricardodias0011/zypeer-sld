import api from "../api";

export class AcademicService {
    static async create(data: any) {
        return api.post(`/academic/`, data);
    }

    static async listSubjects() {
        return api.get(`/academic/subjects`);
    }

    static async listTopics(id: string) {
        return api.get(`/academic/topics/${id}`);
    }

    static async listAllTopics({ diciplineId, search }: { search?: string, diciplineId?: string }) {
        return api.get(`/academic/question/topics/`, {
            params: {
                discipline: diciplineId, search
            }
        });
    }
}