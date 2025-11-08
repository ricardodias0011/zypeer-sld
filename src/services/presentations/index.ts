import api from "../api";

export class PresentationsService {
    static async create(data: {
        title: string,
        disciplineId?: string,
        topic?: string,
        isIa?: boolean,
        templateId?: string
    }) {
        return api.post(`/presentations/create${data.isIa ? "/ia" : ""}`, data);
    }

    static async createAi(data: {
        title: string,
        disciplineId?: string,
        topic: string,
        numberOfSlides: number;
        context?: string
    }) {
        return api.post(`/presentations/create/ia`, data);
    }

    static async update(data: any, idPresentation: string) {
        return api.put(`/presentations/${idPresentation}`, data);
    }

    static async list(id?: string, show?: boolean) {
        return api.get(`/presentations${id ? `/${id}` : ''}`, {
            params: { show }
        });
    }

    static async listTemplate() {
        return api.get(`/presentations/templates`);
    }

    static async show(id?: string) {
        return api.get(`/presentations/show/${id}`);
    }

    static async delete(id?: string) {
        return api.delete(`/presentations/${id}`);
    }

    static async export(files: File[], indexs: string[], type?: "pdf") {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        formData.append('indexs', JSON.stringify(indexs));
        return api.post(`/presentations/export/${type}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
    }
}