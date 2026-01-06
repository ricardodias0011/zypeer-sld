import useQuery from "@/hooks/useQuery";
import { PresentationsService } from "@/services/presentations";
import { useSlideStore, type Slide } from "@/stores/slideStore";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PresentationMode } from "../presentationMode";

const Skeleton = () => (
  <div className="animate-pulse flex flex-col gap-4 w-full h-full max-h-80 my-4">
    <div className="bg-gray-300 h-full w-full rounded-lg" />
  </div>
);

const ShowApresentation = () => {
  const { id } = useParams();
  const { query } = useQuery();

  const { addSlide } = useSlideStore();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);


  const getPresentations = useCallback((targetId?: string) => {
    const activeId = targetId || id;
    if (!activeId || activeId === "creating") return;

    setLoading(true);
    PresentationsService.list(activeId)
      .then(({ data }) => {
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


  useEffect(() => {
    getPresentations();
  }, [getPresentations]);


  return <PresentationMode slides={slides} />;
}


export default ShowApresentation;