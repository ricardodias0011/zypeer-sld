import useAuth from "@/context/auth";
import useQuery from "@/hooks/useQuery";
import { PresentationsService } from "@/services/presentations";
import { useSlideStore, type Slide } from "@/stores/slideStore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PresentationViewDownloadItem } from "./p";


const PresentationViewDownload = () => {
  const { id } = useParams();
  const { query } = useQuery();
  const token = query.get("temp_token_access");

  const { account } = useAuth();

  const { addSlide } = useSlideStore();
  const [slides, setSlides] = useState<Slide[]>([]);


  const getPresentations = () => {
    console.log(token)
    PresentationsService.show(id, token)
      .then(({ data }) => {
        const list = data?.presentations || [];
        setSlides(list);
        list.forEach((slide: Slide) => {
          addSlide("type-1", slide, slide.id)
        });
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
      });
  }


  useEffect(() => {
    getPresentations();
  }, [account, id]);


  return <PresentationViewDownloadItem slides={slides} />;
}


export default PresentationViewDownload;