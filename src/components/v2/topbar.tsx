import { Button } from '@/components/v2/ui/button';
// import { useSlideStore } from '@/stores/slideStore';
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
  Plus,
  Redo2,
  Save,
  Undo2
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
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentation</title>
  <style>
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background: #121212; }
    .slide { min-height: 100vh; padding: 4rem; display: flex; flex-direction: column; gap: 2rem; }
    .card { background: #1f1f1f; border-radius: 8px; padding: 2rem; color: #fff; }
    h1 { color: #FF8C42; margin: 0 0 2rem 0; }
  </style>
</head>
<body>
   ${slides.map(slide => `
      <div class="slide">
        <h1>${slide.title}</h1>
        ${slide.cards.map(card => `
          <div class="card">
            ${card.imageUrl ? `<img src="${card.imageUrl}" alt="" style="max-width: 100%; border-radius: 4px; margin-bottom: 1rem;">` : ''}
            <div>${card.content.replace(/\n/g, '<br>')}</div>
          </div>
        `).join('')}
      </div>
    `).join('')}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'presentation.html';
    link.click();
  };

  return (
    <div className="border-b border-gray-200 bg-white flex items-center justify-between p-2">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-foreground">Slide Editor</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
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
        </Button>

        <div className="w-px h-6 bg-gray-400 mx-2" />

        <Button
          variant="ghost"
          size="icon"
          onClick={saveToLocalStorage}
          title="Save (Ctrl+S)"
        >
          <Save className="h-4 w-8" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Export">
              <Download className="h-4 w-8" />
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
          variant="ghost"
          onClick={addSlide}
          className="gap-2"
        >
          <Plus className="h-4 w-8" />
          New Slide
        </Button>

        <Button
          onClick={togglePresentationMode}
          className="gap-2"
        >
          <Play className="h-4 w-8" />
          Present
        </Button>
      </div>
    </div>
  );
};
