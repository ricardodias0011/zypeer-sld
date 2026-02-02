import Logo from '@/assets/mini-micro-logo.svg';
import { Button } from '@/components/v2/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/v2/ui/dialog";
import { cn, isDesktop } from '@/lib/utils';
import { PresentationsService } from '@/services/presentations';
import { useSlideStore } from '@/stores/slideStore';
import { Download, Loader2, Play, Share2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export const Toolbar = ({ presentationId }: { presentationId: string }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const { togglePresentationMode } = useSlideStore();

  const handleDownloadPdf = () => {
    setIsDownloadModalOpen(true);
    setIsLoading(true);
    setDownloadUrl(null);

    PresentationsService.downalodPdf(presentationId)
      .then(({ data }) => {
        const url = data?.url || "";
        setDownloadUrl(url);
      })
      .catch(() => {
        setIsDownloadModalOpen(false);
        toast.error("Erro ao gerar PDF");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const generatingLink = () => {
    setIsLoading(true);
    PresentationsService.update({ isPublic: true }, presentationId || "")
      .then(() => {
        setIsPublic(true);
        const shareUrl = `${window.location.origin}/docs/v2/show/${presentationId}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link gerado e copiado com sucesso!");
        setIsShareModalOpen(false);
      })
      .catch(() => {
        toast.error("Erro ao gerar link de apresentação");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleOpenLink = (url: string) => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'OPEN_EXTERNAL_LINK',
        url
      }));
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="bg-linear-to-r from-blue-700 from-30% via-blue-500 via-50% to-blue-700 flex items-center justify-between p-2">
      <a href='/' className="flex items-center gap-2">
        <img src={Logo} alt="Logo" className="h-8 w-36" />
      </a>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className={cn(isDesktop() ? "" : "p-0 py-1", "gap-2 text-white")}
          onClick={handleDownloadPdf}>
          <Download className="h-4 w-8 " />
          Download
        </Button>

        <Button
          variant="ghost"
          className={cn(isDesktop() ? "" : "p-0 py-1", "gap-2 text-white")}
          onClick={() => setIsShareModalOpen(true)}
        >
          <Share2 className={"h-4 w-8"} />
          {isDesktop() ? 'Compartilhar' : 'Link de apresentação'}
        </Button>

        {isDesktop() && (
          <Button onClick={togglePresentationMode} className="gap-2">
            <Play className="h-4 w-8" />
            Apresentar
          </Button>
        )}
      </div>

      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Apresentação</DialogTitle>
            <DialogDescription className='text-gray-700 py-2'>
              Envie este slide para seus professores ou colegas de classe e colabore em tempo real.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button
              disabled={isLoading}
              onClick={generatingLink}
            >
              {isLoading ? "Gerando..." : isPublic ? "Copiar link de acesso" : "Gerar link de acesso"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isLoading ? 'Gerando PDF...' : 'Download Pronto'}</DialogTitle>
            <DialogDescription className="hidden">Status do download</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 py-6">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-sm text-gray-500">Aguarde um momento...</span>
              </div>
            ) : (
              <Button
                onClick={() => handleOpenLink(downloadUrl || "#")}
                className="w-full"
              >
                Abrir PDF
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};