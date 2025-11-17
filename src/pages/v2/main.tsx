import { SlidesPanel } from "@/components/v2/panel";
import { Toolbar } from "@/components/v2/topbar";
import { isDesktop } from "@/lib/utils";
import { useSlideStore } from "@/stores/slideStore";
import { useLayoutEffect, useRef } from "react";
import { PresentationMode } from "./presentationMode";
import Slide from "./slide";

const MainSlide = () => {
  const { isPresentationMode } = useSlideStore();
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
    <div className="bg-gray-100 font-sans text-gray-800" style={{ paddingBottom: '120px', overflow: 'hidden' }}>
      <Toolbar />
      <div className="flex-1 flex overflow-hidden w-full">
        <SlidesPanel />
        <main ref={mainRef} className="max-w-6xl mx-auto mt-12 overflow-auto min-h-screen ">
          <Slide />
        </main>
      </div>
    </div>
  )
}

export default MainSlide;