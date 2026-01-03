import { SlidesPanel } from "@/components/v2/panel";
import { Toolbar } from "@/components/v2/topbar";
import useQuery from "@/hooks/useQuery";
import { cn, isDesktop } from "@/lib/utils";
import { EventsService } from "@/services/events";
import { PresentationsService } from "@/services/presentations";
import { useSlideStore, type Slide } from "@/stores/slideStore";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PresentationMode } from "./presentationMode";
import SlideContent from "./slide";

const Skeleton = () => (
  <div className="animate-pulse flex flex-col gap-4 w-full h-full max-h-80 my-4">
    <div className="bg-gray-300 h-full w-full rounded-lg" />
  </div>
);

const MainSlide = () => {
  const { id } = useParams();
  const { query } = useQuery();
  const navigate = useNavigate();

  const slide_count = Number(query.get("slide_count") || 5);
  const eventID = query.get("event_id");

  const { addSlide, isPresentationMode } = useSlideStore();
  const [dataPresentation, setDataPresentation] = useState<{ presentations: Slide[]; id: string; thumbnailId?: string } | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  const mainRef = useRef<HTMLElement>(null);

  const getPresentations = useCallback((targetId?: string) => {
    const activeId = targetId || id;
    if (!activeId || activeId === "creating") return;

    setLoading(true);
    PresentationsService.list(activeId)
      .then(({ data }) => {
        setDataPresentation(data);
        const list = data?.presentations || [];
        setSlides(list);
        list.forEach((slide: Slide) => {
          addSlide("type-1", slide, slide.id)
        });
      })
      .finally(() => {
        if (!targetId)
          setLoading(false)
      });
  }, [id, addSlide]);

  useLayoutEffect(() => {
    if (!isDesktop() || !mainRef.current) return;

    const handleResize = () => {
      // const targetWidth = 1024;
      // const viewportWidth = document.body.clientWidth;
      // const mainEl = mainRef.current!;

      // if (viewportWidth < targetWidth) {
      //   const scale = viewportWidth / (targetWidth + 32);
      //   mainEl.style.transform = `scale(${scale})`;
      //   mainEl.style.transformOrigin = "top center";
      // } else {
      //   mainEl.style.transform = "none";
      // }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    getPresentations();
  }, [getPresentations]);

  useEffect(() => {
    if (!eventID) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await EventsService.consult("presentation", eventID);
        if (!data?.status) return;

        const firstMetadata = data.metadata?.[0];

        if (firstMetadata?.id) {
          getPresentations(firstMetadata.id);
        }

        if (data.status === 4 && firstMetadata) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            navigate(`/docs/v2/${firstMetadata.id}`);
          }, 500);
        } else if (data.status === 0) {
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [eventID, navigate, getPresentations]);

  if (isPresentationMode) return <PresentationMode slides={slides} />;

  return (
    <div className={cn(dataPresentation?.thumbnailId === "v2-default" ? "bg-black" : "bg-gray-100", "font-sans text-gray-800 min-h-screen overflow-hidden")}>
      <Toolbar />
      <div className="flex-1 flex h-[calc(100vh-75px)] overflow-hidden w-full">
        <SlidesPanel
          loading={loading}
          loadingCount={slide_count}
          slides={slides}
          id={id}
          updatePresentation={setSlides}
          dataPresentation={dataPresentation}
        />

        <div className="flex-1 flex h-full overflow-auto py-8 w-full">
          <main ref={mainRef} className="h-full max-w-6xl mx-auto w-full">
            {loading ? (
              Array.from({ length: slide_count }).map((_, i) => <Skeleton key={i} />)
            ) : (
              <SlideContent
                dataPresentation={dataPresentation}
                slides={slides}
                updatePresentation={setSlides}
              />
            )}
            <div className="h-[60px]" />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainSlide;