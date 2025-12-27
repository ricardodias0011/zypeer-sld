import { SlidesPanel } from "@/components/v2/panel";
import { Toolbar } from "@/components/v2/topbar";
import { useSlideContext } from "@/context/slides";
import { isDesktop } from "@/lib/utils";
import { PresentationsService } from "@/services/presentations";
import { useSlideStore } from "@/stores/slideStore";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { PresentationMode } from "./presentationMode";
import Slide from "./slide";

const MainSlide = () => {
  const { id } = useParams();
  const { addSlide } = useSlideStore();
  const [dataPresentation, setDataPresentation] = useState(null);

  const {
    isPresentationMode
  } = useSlideContext(state => ({
    isPresentationMode: state.isPresentationMode,
    updateSlide: state.updateSlide
  }));

  const getPresentations = () => {
    PresentationsService.list(id)
      .then(({ data }) => {
        data?.presentations.forEach((slide: any) => {
          addSlide("type-1", slide.content, slide.id);
        })
        setDataPresentation(data);
      })
  }

  const mainRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (isDesktop()) {
      const mainEl = mainRef.current;
      if (!mainEl) return;

      const handleResize = () => {
        const targetWidth = 1024;
        const viewportWidth = document.body.clientWidth;

        if (viewportWidth < targetWidth) {
          const scale = viewportWidth / (targetWidth + 32);
          (mainEl.style as any).zoom = scale;
        } else {
          (mainEl.style as any).zoom = 1;
        }
      };

      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (id)
      getPresentations();
  }, [id])


  if (isPresentationMode) {
    return <PresentationMode />;
  }

  return (
    <div className="bg-gray-100 font-sans text-gray-800 min-h-screen" style={{ overflow: 'hidden' }}>
      <Toolbar />
      <div className="flex-1 flex h-full overflow-hidden w-full" style={{ height: 'calc(100vh - 75px)' }}>
        <SlidesPanel />
        <div className="flex-1 flex h-full overflow-auto py-8 w-full">
          <main ref={mainRef} className="h-full max-w-6xl mx-auto">
            <Slide dataPresentation={dataPresentation} />
            <div style={{ height: '60px' }} />
          </main>
        </div>
      </div>
    </div>
  )
}

export default MainSlide;