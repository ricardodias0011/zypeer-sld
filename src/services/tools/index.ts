import api from "../api";

export class ToolsService {
  static async rewriter(data: { originalText: string; description?: string }) {
    return api.post(`/tools/text-rewriter`, data);
  }

  static async rewriterDownload(data: { text: string }) {
    return api.post(`/tools/text-rewriter`, data);
  }

  static async summarizeTopic(text: string) {
    return api.post(`/tools/summariz-topic`, {
      text
    });
  }

  static async generateImage(text: string) {
    return api.post(`/tools/generate/image`, {
      text
    });
  }

  static async generateImageToColor(text: string) {
    return api.post(`/tools/generate/image/color`, {
      text
    });
  }

  static async studyPlan(text: string) {
    return api.post(`/tools/study-plan-generator`, {
      text
    });
  }

  static async lessonPlan(text: string) {
    return api.post(`/tools/lesson-plan-generator`, {
      text
    });
  }

  static async prepareLesson(data: {
    topic: string;
    numberOfWeeks: number;
    discipline: string;
    numberOfDays: number[];
  }) {
    return api.post(`/tools/prepare-lesson`, data);
  }

  static async mindMap(text: string) {
    return api.post(`/tools/mind-map-genarator`, {
      text
    });
  }

  static async videoQuestions(data: any) {
    return api.post(`/tools/create/questions/video`, data);
  }

  static async videoResume(data: any) {
    return api.post(`/tools/create/resume/video`, data);
  }

  static async task(text: string) {
    return api.post(`/tools/project/task`, {
      text
    });
  }

  static async magicSpace(data: { text: string, title: string, disciplineId?: string }) {
    return api.post(`/tools/magic-space`, data);
  }

  static async fixQuestion(data: { text: string, question: string, description?: string }) {
    return api.post(`/tools/fix-question`, data);
  }

  static async chat(data: { input: string, chatId: String }) {
    return api.post(`/tools/chat`, data);
  }

  static async chats() {
    return api.get(`/tools/chats`);
  }

  static async getChat(id: string) {
    return api.get(`/tools/chat/${id}`);
  }

  static async getMateriais(data: any) {
    return api.get(`/tools/materiais`, {
      params: data
    });
  }

  static async deleteChat(id: string) {
    return api.delete(`/tools/chat/${id}`);
  }


  static async shareRoom(idlesson: string, roomId: string) {
    return api.post(`/tools/share/lesson/${idlesson}/${roomId}`);
  }

  static async analizy(data?: File | null, text?: string) {
    let file = new FormData()
    if (data) {
      file.append('file', data)
      return api.post(`/tools/analizy-essay`, file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
    }
    return api.post(`/tools/analizy-essay/text`, { text });
  }

  static async findMaterial(id: string) {
    return api.get(`/tools/material/${id}`);
  }
}