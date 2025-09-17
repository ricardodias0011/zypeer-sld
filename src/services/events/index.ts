import api from "../api";

export class EventsService {
    static async list(date: Date) {
        return api.get(`/events/`, {
            params: {
                date
            }
        });
    }

    static async consult(type: string, id: string) {
        return api.get(`/events/ai/${type}/${id}`)
    }
}