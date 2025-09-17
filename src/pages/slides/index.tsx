import { useEffect, useRef, useState } from "react"
import { PresentationsService } from "../../services/presentations";
import useAuth from "../../context/auth";
import { Flex } from "@radix-ui/themes";
import { Editor } from "../../components/editor";
import { useNavigate, useParams } from "react-router-dom";
import type { PresentationProject, PresentationSlide } from "../../types/presentations-sliders";
import { v4 } from "uuid";
import { ToastContainer } from "react-toastify";
const SlidePage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [canUpdate, setCanUpdate] = useState(false);
  const [apresentation, setApresentation] = useState<PresentationProject | null>(null);
  const [currentApresentation, setCurrentApresentation] = useState<PresentationSlide | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [thumbnailId, setThumbnailId] = useState("");
  const [savingStatus, setSavingStatus] = useState<"success" | "peding" | "erro" | "sending">("success");
  const timeoutRef = useRef<any>(null);
  // const [loading, setLoading] = useState(false);

  const getPresentations = () => {
    // setLoading(true);
    PresentationsService.list(id)
      .then(({ data }) => {
        setApresentation(data);
        setThumbnailId(data?.thumbnailId ?? "")
      })
    // .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (apresentation && currentApresentation && canUpdate) {

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        updatePresentations();
      }, 2000);
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

    }
  }, [apresentation, currentApresentation, canUpdate])

  const updatePresentations = (data?: { thumbnailId?: string, thumbnail?: string, noUpdate?: boolean }) => {
    if (apresentation?.presentations && currentApresentation?.items) {
      apresentation.presentations[currentSlideIndex].items = currentApresentation.items
    }
    if (apresentation && canUpdate) {
      const tmb = apresentation.thumbnail
      const tmbID = apresentation?.thumbnailId
      setSavingStatus('sending')
      PresentationsService.update({
        isPublic: apresentation?.isPublic,
        presentations: apresentation?.presentations,
        title: apresentation?.title,
        effectTransition: apresentation?.effectTransition,
        order: apresentation?.order,
        thumbnailId: ((currentSlideIndex === 0 ? data?.thumbnailId : tmbID) ?? tmbID) ?? undefined,
        thumbnail: ((currentSlideIndex === 0 ? data?.thumbnail : tmb) ?? tmb) ?? undefined,

      }, apresentation.id)
        .then(() => {
          setSavingStatus("success");
        })
        .catch(() => setSavingStatus("erro"))
    }
    if (data?.thumbnailId) {
      setThumbnailId(data.thumbnailId)
    }
  }

  // const editSlideVariables = (content: PresentationSlide) => {
  //   setCurrentApresentation(content)
  // }

  const updateSlideContent = (content: any) => {
    if (currentApresentation) {
      const updatedPresentations: PresentationSlide = { ...currentApresentation };
      if (updatedPresentations.items === content) {
        return
      }
      updatedPresentations.items = content
      setCurrentApresentation(updatedPresentations)
      setSavingStatus('peding')
    }
  }

  const updateIndexesSlides = (slides: PresentationSlide[]) => {
    if (apresentation?.presentations) {
      setCanUpdate(true)
      setSavingStatus("peding");
      const updatedPresentations: PresentationProject = { ...apresentation };
      updatedPresentations.presentations = slides
      updatedPresentations.order = slides.map(a => a.id)
      setApresentation(updatedPresentations)
    }
  }

  const deleteCurrentSlide = (slide: PresentationSlide) => {
    if (apresentation?.presentations) {
      const updatedPresentations: PresentationProject = { ...apresentation };
      updatedPresentations.presentations = updatedPresentations.presentations.filter(a => a.id !== slide.id)
      setApresentation(updatedPresentations)
      const nI = currentSlideIndex > 0 ? currentSlideIndex - 1 : 0
      setCurrentSlideIndex(nI)
      setSavingStatus("peding")
      setCanUpdate(true)
    }
  }

  const addSlideCurrentApresentation = () => {
    const newSlideAdd: PresentationSlide = {
      id: v4(),
      background: {
        type: 'color',
        color: '#fff'
      },
      items: [],
      theme: {},
      imagePosition: 'default'
    }
    if (apresentation) {
      const updatedPresentation: PresentationProject = { ...apresentation };
      updatedPresentation.presentations.push(newSlideAdd);
      updatedPresentation.order.push(newSlideAdd.id);
      setApresentation(updatedPresentation);
      setCurrentApresentation(newSlideAdd);
      setCurrentSlideIndex(updatedPresentation.presentations.length);
    }
    setSavingStatus('peding')
  }

  useEffect(() => {
    if (apresentation) {
      setCurrentApresentation(apresentation.presentations[currentSlideIndex]);
    }
  }, [currentSlideIndex, apresentation]);

  useEffect(() => {
    if (user && id) {
      getPresentations();
    }
    if (!id) {
      navigate("/")
    }
  }, [user, id])

  return (
    <Flex>
      <ToastContainer />
      {
        apresentation &&
        <Editor
          savingStatus={savingStatus}
          slides={apresentation.presentations ?? []}
          thumbnailId={thumbnailId}
          deleteCurrentSlide={deleteCurrentSlide}
          currentShapes={currentApresentation?.items}
          changeSlides={e => {
            const newAprensetation = { ...apresentation };
            newAprensetation.presentations = e
            if (newAprensetation)
              setApresentation(newAprensetation)
          }}
          updateVariablesSlide={(e) => {
            setCanUpdate(true)
            setCurrentApresentation(e)
            const newAprensetation = { ...apresentation };
            newAprensetation.presentations[currentSlideIndex] = e
            if (newAprensetation)
              setApresentation(newAprensetation)
          }}
          currentSlide={currentApresentation}
          indexSlide={currentSlideIndex}
          setCurrentSlideIndex={setCurrentSlideIndex}
          updateThumbnail={(link, id) => {
            updatePresentations({
              thumbnail: link,
              thumbnailId: id,
            })
          }}
          updateSlide={(data, _id, noServerUpdate) => {
            setCanUpdate(noServerUpdate ? false : true)
            updateSlideContent(data)
            // setCanUpdate(true);
          }}
          updateIndexesSlides={updateIndexesSlides}
          updatePresentations={updatePresentations}
          addSlideCurrentApresentation={addSlideCurrentApresentation}
        />
      }
    </Flex>
  )
}

export default SlidePage;