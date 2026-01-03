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
import { useSlideStore } from '@/stores/slideStore';
import { Download, Play, Share2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const Toolbar = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { togglePresentationMode, slides } = useSlideStore();

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(slides, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'presentation.json');
    linkElement.click();
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
          onClick={handleExportJSON}>
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
            <Button onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setIsShareModalOpen(false);
              toast.success("Link de acesso copiado com sucesso!");
            }}>
              Copiar link de acesso
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};