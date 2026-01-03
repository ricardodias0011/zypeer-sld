import Logo from '@/assets/logo-white.png';
import { Button } from '@/components/v2/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/v2/ui/dropdown-menu';
import { useSlideStore } from '@/stores/slideStore';
import {
  Download,
  Play,
  Save
} from 'lucide-react';

export const Toolbar = () => {
  const {
    addSlide,
    togglePresentationMode,
    undo,
    redo,
    saveToLocalStorage,
    slides
  } = useSlideStore();

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(slides, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'presentation.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportHTML = () => {
    const html = `
`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'presentation.html';
    link.click();
  };

  return (
    <div className="bg-linear-to-r from-blue-700 from-30% via-blue-500 via-50% to-blue-700 flex items-center justify-between p-2">
      <a href='/' className="flex items-center gap-2">
        <img src={Logo} alt="Logo" className="h-8 w-36" />
      </a>

      <div className="flex items-center gap-2">
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-full w-full" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-8" />
        </Button> */}

        {/* <div className="w-px h-6 bg-gray-400 mx-2" /> */}

        <Button
          variant="ghost"
          size="icon"
          onClick={saveToLocalStorage}
          title="Save (Ctrl+S)"
        >
          <Save className="h-4 w-8 text-white" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Export">
              <Download className="h-4 w-8 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleExportJSON}>
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportHTML}>
              Export as HTML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-gray-400 mx-2" />

        <Button
          onClick={togglePresentationMode}
          className="gap-2"
        >
          <Play className="h-4 w-8" />
          Apresentar
        </Button>
      </div>
    </div>
  );
};
