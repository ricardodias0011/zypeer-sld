import { Button } from "@/components/v2/ui/button";
import { EventsService } from "@/services/events";
import { ToolsService } from "@/services/tools";
import { useEffect, useState } from "react";
import { PiMagicWand } from "react-icons/pi";
import { toast } from "react-toastify";

interface MagicGeneratingImage {
  onGenerate: (e: string) => void;
  prompt: string;
}

export const MagicGeneratingImage = (props: MagicGeneratingImage) => {
  const { onGenerate, prompt } = props;
  const [eventId, setEventId] = useState<string | null>(null);
  const [loadingGenerating, setLoadingGenerating] = useState(false);

  const resetLoading = () => {
    setEventId(null);
    setLoadingGenerating(false);
  };


  const handleGenerate = (prompt: string) => {
    if (loadingGenerating || !prompt) return;
    setLoadingGenerating(true);

    ToolsService.generateImage(prompt)
      .then(res => res?.data?.id ? setEventId(res.data.id) : setLoadingGenerating(false))
      .catch(() => {
        setLoadingGenerating(false);
        toast.error("Não foi possível gerar imagem.");
      });
  };

  useEffect(() => {
    if (!eventId) return;

    const interval = setInterval(() => {
      EventsService.consult("generate-image", eventId)
        .then(({ data }) => {
          if (!data?.status) return;

          if (data.status === 0) {
            clearInterval(interval);
            resetLoading();
            toast.error("Não foi possível gerar imagem.");
          }

          if (data.status === 4 && data.metadata?.[0]?.id) {
            clearInterval(interval);
            ToolsService.findMaterial(data.metadata[0].id)
              .then((res) => {
                if (res?.data?.content) {
                  const content = res.data.content as string;
                  onGenerate(content);
                }
              })
              .finally(resetLoading);
          }
        })
        .catch((err) => {
          clearInterval(interval);
          resetLoading();
          toast.error(err?.response?.data?.message ?? "Erro ao consultar status");
        });
    }, 4000);

    return () => clearInterval(interval);
  }, [eventId, onGenerate]);
  return (
    <Button
      onClick={() => handleGenerate(prompt)}
      disabled={loadingGenerating}
      className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all active:scale-95 p-2 py-1"
    >
      <PiMagicWand className="w-4 h-4 mr-2" />
      {loadingGenerating ? "Gerando imagem..." : "Gerar imagem com IA"}
    </Button>
  )
}