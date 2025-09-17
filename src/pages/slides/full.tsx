import { useEffect, useRef, useState } from "react";
import PreviewSlide from "../../components/editor/preview";
import { PresentationsService } from "../../services/presentations";
import type { PresentationProject, PresentationSlide } from "../../types/presentations-sliders";
import { useNavigate, useParams } from "react-router-dom";
import { Flex, Grid, IconButton } from "@radix-ui/themes";
import { FiX } from "react-icons/fi";
import { TfiArrowLeft, TfiArrowRight, TfiLightBulb } from "react-icons/tfi";
import { BsFullscreen, BsFullscreenExit } from "react-icons/bs";


const FullApresentation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apresentation, setApresentation] = useState<PresentationProject | null>(null);
  const [currentSlide, setCurrentSlide] = useState<PresentationSlide | null>(null);
  const [proportion, setProportion] = useState({
    width: 0,
    height: 0
  })
  const [fullScreen, setFullScreen] = useState(false);
  // const [loading, setLoading] = useState(false);

  const [showControls, setShowControls] = useState(true);
  const timeoutId = useRef<any | null>(null);


  useEffect(() => {
    const updateScale = () => {
      setProportion({
        height: window.innerHeight,
        width: window.innerWidth
      })
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    const handleExitFullscreen = () => {
      if (!document.fullscreenElement) {
        Close()
      }
    }
    document.addEventListener('fullscreenchange', handleExitFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', handleExitFullscreen);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      timeoutId.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      requestFullscreen();
    } else {
      Close();
    }
  }

  const requestFullscreen = () => {
    let elem = document.documentElement;
    elem.requestFullscreen();
    setFullScreen(true);
  }

  useEffect(() => {
    setTimeout(() => {
      // requestFullscreen();
    }, 100)
  }, [apresentation]);


  const Close = () => {
    if (document.fullscreenElement) {
      setFullScreen(false);
      document.exitFullscreen();
    }
  }


  const eventChangeSlide = (diction: "ArrowRight" | "ArrowLeft") => {
    const SlidesLength = apresentation?.presentations.length ?? 0;
    const cl = apresentation?.presentations.findIndex(a => a.id === currentSlide?.id) ?? -1;
    if (cl === -1) return;

    let newIndex = cl;

    if (diction === "ArrowRight" && cl + 1 < SlidesLength) {
      newIndex = cl + 1;
    } else if (diction === "ArrowLeft" && cl > 0) {
      newIndex = cl - 1;
    }

    setCurrentSlide(apresentation?.presentations[newIndex] || null);
  };

  const handleKeySlide = (event: any) => {
    const key = event.key;
    if (key === 'f') {
      toggleFullScreen();
    }
    eventChangeSlide(key);
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeySlide);
    return () => {
      document.removeEventListener('keydown', handleKeySlide);
    };
  }, [currentSlide, fullScreen]);

  const getPresentations = () => {
    PresentationsService.list(id)
      .then(({ data }) => {
        setApresentation(data);
        if (data?.presentations?.length > 0) {
          setCurrentSlide(data.presentations[0])
        }
      })
    // .finally(() => setLoading(false))
  }

  useEffect(() => {
    getPresentations();
  }, [])

  return (
    <Grid height={'100vh'} width="100vw" style={{
      backgroundColor: 'black',
      position: 'relative'
    }}>
      <PreviewSlide height={proportion.height} width={proportion.width} currentSlide={currentSlide} />
      {showControls && (
        <Flex
          position="absolute"
          height="100%"
          left={'8'}
          bottom={'5'}
          justify={"between"}
          align="start"
          direction={"column"}
          style={{
            width: "calc(100% - 96px)"
          }}
        >
          <Grid position="absolute" top={'8'}>
            <IconButton variant="ghost" style={{ backgroundColor: '#ffffff30' }} onClick={() => {
              Close();
              navigate("/docs/" + id);
            }}>
              <FiX color="white" size={20} />
            </IconButton>
          </Grid>
          <Grid></Grid>
          <Flex gap={"4"} direction="row" justify="between" width="100%">
            <Flex gap={"4"} style={{ backgroundColor: "#ffffff30", borderRadius: 10 }} p="2">
              <IconButton onClick={() => eventChangeSlide("ArrowLeft")}>
                <TfiArrowLeft color="white" size={20} />
              </IconButton>
              <IconButton>
                <TfiLightBulb color="white" size={20} />
              </IconButton>
              <IconButton onClick={() => eventChangeSlide("ArrowRight")}>
                <TfiArrowRight color="white" size={20} />
              </IconButton>
            </Flex>
            <IconButton onClick={toggleFullScreen}>
              {fullScreen ? <BsFullscreenExit color="white" size={20} /> : <BsFullscreen color="white" size={20} />}
            </IconButton>
          </Flex>
        </Flex>
      )}

    </Grid>
  )
}

export default FullApresentation;