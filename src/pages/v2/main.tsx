import { SlidesPanel } from "@/components/v2/panel";
import { Toolbar } from "@/components/v2/topbar";
import { useSlideContext } from "@/context/slides";
import { isDesktop } from "@/lib/utils";
import { useLayoutEffect, useRef } from "react";
import { PresentationMode } from "./presentationMode";
import Slide from "./slide";

const MainSlide = () => {

  const { isPresentationMode } = useSlideContext(state => ({
    isPresentationMode: state.isPresentationMode
  }));

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
            <Slide />
            <div style={{ height: '60px' }} />
          </main>
        </div>
      </div>
    </div>
  )
}

export default MainSlide;