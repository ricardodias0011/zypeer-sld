import * as Tabs from '@radix-ui/react-tabs';
import { Box, Button, Flex, IconButton, Popover, Text } from "@radix-ui/themes";
import { Chrome } from '@uiw/react-color';
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { FiImage, FiX } from "react-icons/fi";
import RGB_COLOR from "../../../assets/icons/rgb-print.png";
import useQuery from "../../../hooks/useQuery";
import type { PresentationSlide } from "../../../types/presentations-sliders";

interface TopBarMenuProps {
  currentSlide: PresentationSlide | null;
  updateVariablesSlide: (a: PresentationSlide) => void;
  deleteCurrentSlide: (a: PresentationSlide) => void;
  lenghtSlides: number
}



const TopBarMenuDefault = (props: TopBarMenuProps) => {
  const { handleChangeQuery } = useQuery();
  const { currentSlide, updateVariablesSlide, deleteCurrentSlide, lenghtSlides } = props;

  const [color, setColor] = useState("#131313");
  const [gradientSteps, setGradientSteps] = useState<string[]>([]);

  const [newColor, setNewColor] = useState("#ff00cc");
  const [currentIndexColor, setCurrentIndexColor] = useState<number | null>(null);
  const [currentColor, setCurrentColor] = useState<string | null>(null);

  useEffect(() => {
    if (currentSlide &&
      currentSlide.background.type === 'gradient' &&
      (currentSlide.background.color as string[]) !== gradientSteps
    ) {
      setGradientSteps((currentSlide.background.color as string[]).filter(e => typeof e === 'string'))
    }
    if (currentSlide &&
      currentSlide.background.type === 'color' &&
      currentSlide.background.color !== color
    ) {
      setColor(currentSlide.background.color as string)
    }
  }, [currentSlide])

  const handleSlide = (e: PresentationSlide) => {
    if (currentSlide)
      updateVariablesSlide(e);
  }


  const applyGradient = (colors: string[]) => {
    const count = colors.length;
    const stops: (string | number)[] = [];
    colors.forEach((color, i) => {
      const stop = count === 1 ? 0 : i / (count - 1);
      stops.push(parseFloat(stop.toFixed(2)), color);
    });
    if (currentSlide)
      handleSlide({
        ...currentSlide,
        background: {
          type: 'gradient',
          color: stops as unknown as string[],
          url: ''
        }
      });
  }



  const GradienteBox = () => (
    <Box mt="3">
      <Chrome
        color={newColor}
        style={{
          border: "none",
          boxShadow: "none"
        }}
        onChange={(c) => {
          let newSteps = [...gradientSteps];
          if (typeof currentIndexColor === 'number') {
            if (currentIndexColor < newSteps.length) {
              newSteps[currentIndexColor] = c.hex;
            } else {
              newSteps.push(c.hex);
            }
            setGradientSteps(newSteps);
            applyGradient(newSteps);
          }
          setNewColor(c.hex);
        }}
      />
      <input
        onBlur={(e) => {
          const c = e.target.value
          if (currentSlide) {
            let newSteps = [...gradientSteps];
            if (typeof currentIndexColor === 'number') {
              if (currentIndexColor < newSteps.length) {
                newSteps[currentIndexColor] = c;
              } else {
                newSteps.push(c);
              }
              setGradientSteps(newSteps);
              applyGradient(newSteps);
            }
            setNewColor(c);
          }
        }}
        style={{ width: 150 }}
        value={currentColor ?? "#131313"}
        onChange={e => {
          const _v = e.target.value
          setCurrentColor(_v)
        }} className="input-small" type="text" inputMode="decimal" />
    </Box>
  )


  return (
    <div className="top-bar-menu">
      <Popover.Root>
        <Popover.Trigger>
          {<IconButton variant="ghost">
            <FaRegTrashAlt size={22} />
          </IconButton>}
        </Popover.Trigger>
        <Popover.Content>
          <Text>Realmente deseja excluir pagina?</Text>
          <Flex mt="4" direction="row" gap="2" justify="end">
            <Popover.Close>
              <Button color="gray" variant="soft">
                Fechar
              </Button>
            </Popover.Close>
            <Popover.Close>
              <Button
                disabled={lenghtSlides < 2}
                color="red"
                onClick={() => {
                  if (currentSlide && lenghtSlides > 1) {
                    deleteCurrentSlide(currentSlide)
                  }
                }}>
                Excluir
              </Button>
            </Popover.Close>
          </Flex>
        </Popover.Content>
      </Popover.Root>
      <div className="divider" style={{ height: 30 }} />
      <IconButton variant="ghost" onClick={() => {
        if (currentSlide) {
          handleChangeQuery(currentSlide?.id ?? '', 'replace_bg_img');
        }
      }}>
        <FiImage size={25} />
      </IconButton>
      <Popover.Root>
        <Popover.Trigger>
          <IconButton variant="ghost">
            <img src={RGB_COLOR} width={25} />
          </IconButton>
        </Popover.Trigger>
        <Popover.Content width="360px">
          <Flex gap="3" direction="column">
            <Box flexGrow="1">
              <Tabs.Root
                className="TabsRoot"
                defaultValue="solid"
              >
                <Tabs.List className="TabsList" aria-label="Gerenciar cores">
                  <Tabs.Trigger className="TabsTrigger" value="solid">
                    Cor Sólida
                  </Tabs.Trigger>
                  <Tabs.Trigger className="TabsTrigger" value="gradient">
                    Gradiente
                  </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content className="TabsContent" value="solid">
                  <Chrome
                    color={color}
                    onChange={(newColor) => {
                      setColor(newColor.hex);
                      if (currentSlide)
                        handleSlide({
                          ...currentSlide,
                          background: {
                            type: 'color',
                            color: newColor.hex,
                            url: ''
                          }
                        });
                    }}
                    className="custom-chrome-picker"
                    showAlpha={false}
                    // showHue={false}
                    showEditableInput={false}
                    showColorPreview={false}
                  />
                  <input
                    onBlur={() => {
                      if (currentSlide)
                        handleSlide({
                          ...currentSlide,
                          background: {
                            type: 'color',
                            color: color
                          }
                        });

                    }}
                    style={{ width: 150 }} value={color} onChange={e => {
                      const _v = e.target.value
                      setColor(_v)
                    }} className="input-small" type="text" inputMode="decimal" />
                </Tabs.Content>
                <Tabs.Content className="TabsContent" value="gradient">
                  <Text weight="bold">Cores em gradiente</Text>
                  <Tabs.Content className="TabsContent" value="gradient">
                    <Flex gap="2" wrap="wrap">
                      {gradientSteps.map((gradient, i) => (
                        <div
                          key={i}
                          style={{ position: "relative", marginTop: 25 }}
                          className="preview-btn-color-gradient"
                        >
                          <button
                            style={{
                              width: 30,
                              height: 30
                            }}
                            onClick={() => {
                              const newSteps = [...gradientSteps];
                              newSteps.splice(i, 1);
                              setGradientSteps(newSteps);
                              applyGradient(newSteps);
                            }}
                            className="delete-color-gradient icon-button"
                          >
                            <FiX size={25} color="white" />
                          </button>
                          <Popover.Root>
                            <Popover.Trigger>
                              <button
                                style={{
                                  width: 45,
                                  height: 45,
                                  background: gradient,
                                  borderRadius: 15,
                                  cursor: "pointer"
                                }}
                                onClick={() => {
                                  setCurrentIndexColor(i);
                                  setCurrentColor(gradient);
                                  setNewColor(gradient);
                                }}
                              />
                            </Popover.Trigger>
                            <Popover.Content className="PopoverContent" sideOffset={5}>
                              {GradienteBox()}
                            </Popover.Content>
                          </Popover.Root>
                        </div>
                      ))}
                      <Popover.Root>
                        <Popover.Trigger>
                          <button
                            onClick={() => {
                              setCurrentColor("#000");
                              setCurrentIndexColor(gradientSteps.length);
                              setNewColor("#000");
                            }}
                            style={{
                              width: 45,
                              height: 45,
                              borderRadius: "50%",
                              background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontWeight: "bold",
                              color: "white",
                              fontSize: 18,
                              marginTop: 25
                            }}
                          >
                            +
                          </button>
                        </Popover.Trigger>
                        <Popover.Content className="PopoverContent" sideOffset={5}>
                          {GradienteBox()}
                        </Popover.Content>
                      </Popover.Root>
                    </Flex>
                  </Tabs.Content>
                </Tabs.Content>
              </Tabs.Root>
            </Box>
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </div>
  )
}

export default TopBarMenuDefault;