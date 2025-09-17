import { TbBorderCornerPill } from "react-icons/tb";
import RGB_COLOR from "../../../assets/icons/rgb-print.png"
import { RxBorderWidth, RxFontItalic, RxStrikethrough, RxTransparencyGrid, RxUnderline } from "react-icons/rx";
import { Box, Button, Flex, Grid, IconButton, Popover, Slider, Text, TextArea } from "@radix-ui/themes";
import React, { useEffect, useState, type JSX } from "react";
import { Chrome } from '@uiw/react-color';
import * as Tabs from '@radix-ui/react-tabs';
import type { Shape } from "../../../types/editor";
import { MdBlock, MdLockOpen, MdLockOutline } from "react-icons/md";
import { VscBold } from "react-icons/vsc";
import { IoTextOutline } from "react-icons/io5";
import { fontOptions } from "../../../utils/fonts";
import { FiCheck, FiEdit2, FiImage, FiX } from "react-icons/fi";
import useQuery from "../../../hooks/useQuery";
import { AiOutlineAlignCenter, AiOutlineAlignLeft, AiOutlineAlignRight } from "react-icons/ai";
interface TopBarMenuProps {
  shape?: Shape
  updateShape: (id: string, attrs: Shape) => void;
  bringToFront: (a: string) => void;
  sendToBack: (a: string) => void;
  setTextEditSelcted(a: Shape | null): void;
  textEditSelcted: Shape | null;
}

const AligIcon = {
  left: <AiOutlineAlignLeft size={22} />,
  center: <AiOutlineAlignCenter size={22} />,
  right: <AiOutlineAlignRight size={22} />
}

const TextAlignItems = [
  {
    value: "left",
    icon: <AiOutlineAlignLeft />
  },
  {
    value: "center",
    icon: <AiOutlineAlignCenter />
  },
  {
    value: "right",
    icon: <AiOutlineAlignRight />
  }
]

const layersOptions = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path fill="currentColor" d="M12.75 5.82v8.43a.75.75 0 1 1-1.5 0V5.81L8.99 8.07A.75.75 0 1 1 7.93 7l2.83-2.83a1.75 1.75 0 0 1 2.47 0L16.06 7A.75.75 0 0 1 15 8.07l-2.25-2.25zM15 10.48l6.18 3.04a1 1 0 0 1 0 1.79l-7.86 3.86a3 3 0 0 1-2.64 0l-7.86-3.86a1 1 0 0 1 0-1.8L9 10.49v1.67L4.4 14.4l6.94 3.42c.42.2.9.2 1.32 0l6.94-3.42-4.6-2.26v-1.67z">
        </path>
      </svg>
    ),
    value: '',
    action: 'bringToFront'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path fill="currentColor" d="M12.75 3.82v9.43a.75.75 0 1 1-1.5 0V3.81L8.99 6.07A.75.75 0 1 1 7.93 5l2.83-2.83a1.75 1.75 0 0 1 2.47 0L16.06 5A.75.75 0 0 1 15 6.07l-2.25-2.25zM15 8.48l6.18 3.04a1 1 0 0 1 0 1.79l-7.86 3.86a3 3 0 0 1-2.64 0l-7.86-3.86a1 1 0 0 1 0-1.8L9 8.49v1.67L4.4 12.4l6.94 3.42c.42.2.9.2 1.32 0l6.94-3.42-4.6-2.26V8.48zm4.48 7.34 1.7.83a1 1 0 0 1 0 1.8l-7.86 3.86a3 3 0 0 1-2.64 0l-7.86-3.86a1 1 0 0 1 0-1.8l1.7-.83 1.7.83-1.82.9 6.94 3.41c.42.2.9.2 1.32 0l6.94-3.41-1.82-.9 1.7-.83z">
        </path>
      </svg>
    ),
    value: 'top',
    action: 'bringToFront'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path fill="currentColor" d="M12.75 18.12V9.75a.75.75 0 1 0-1.5 0v8.37l-2.26-2.25a.75.75 0 0 0-1.06 1.06l2.83 2.82c.68.69 1.79.69 2.47 0l2.83-2.82A.75.75 0 0 0 15 15.87l-2.25 2.25zM15 11.85v1.67l6.18-3.04a1 1 0 0 0 0-1.79l-7.86-3.86a3 3 0 0 0-2.64 0L2.82 8.69a1 1 0 0 0 0 1.8L9 13.51v-1.67L4.4 9.6l6.94-3.42c.42-.2.9-.2 1.32 0L19.6 9.6 15 11.85z">
        </path>
      </svg>
    ),
    value: '',
    action: 'sendToBack'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path fill="currentColor" d="m19.48 10.82 1.7.83a1 1 0 0 1 0 1.8L15 16.49V14.8l4.6-2.26-1.82-.9 1.7-.83zm-14.96 0-1.7.83a1 1 0 0 0 0 1.8L9 16.49V14.8l-4.6-2.26 1.82-.9-1.7-.83zm8.23 9.5L15 18.07a.75.75 0 0 1 1.06 1.06l-2.83 2.83c-.68.68-1.79.68-2.47 0l-2.83-2.83a.75.75 0 0 1 1.06-1.06l2.26 2.26V6.9a.75.75 0 1 1 1.5 0v13.43zM15 11.35V9.68l4.6-2.27L12.66 4c-.42-.2-.9-.2-1.32 0L4.4 7.4 9 9.68v1.67L2.82 8.3a1 1 0 0 1 0-1.8l7.86-3.86a3 3 0 0 1 2.64 0l7.86 3.87a1 1 0 0 1 0 1.79L15 11.35z">
        </path>
      </svg>
    ),
    value: 'bottom',
    action: 'sendToBack'
  }
]

const dashOptions: { value: number[] | undefined; icon: JSX.Element }[] = [
  {
    value: undefined,
    icon: <MdBlock />,
  },
  {
    value: [0, 0],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <line x1="0" x2="24" y1="12" y2="12" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    value: [14, 2],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <line x1="0" x2="24" y1="12" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="12 2" />
      </svg>
    ),
  },
  {
    value: [8, 2],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <line x1="0" x2="24" y1="12" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="6 2" />
      </svg>
    ),
  },
  {
    value: [4, 2],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <line x1="0" x2="24" y1="12" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
      </svg>
    ),
  },
];



const TopBarMenu = (props: TopBarMenuProps) => {

  const { shape, updateShape, bringToFront, sendToBack, textEditSelcted, setTextEditSelcted } = props;
  const { handleChangeQuery } = useQuery();

  const [color, setColor] = useState(shape?.fill ?? "#131313");
  const [radius, setRadius] = useState(shape?.cornerRadius ?? 0);
  const [dash, setDash] = useState<number[] | undefined>(shape?.dash ?? undefined);
  const [stroke, setStroke] = useState<number | null>(shape?.strokeWidth ?? null);
  const [opacity, setOpacity] = useState<number | null>((shape?.opacity ?? 1) * 100);
  const [gradientSteps, setGradientSteps] = useState<string[]>(
    shape?.fillLinearGradientColorStops?.filter((e) => typeof e === 'string') ?? []
  );

  const [fontSize, setFontSize] = useState(shape?.fontSize ?? 20);

  const [newColor, setNewColor] = useState("#ff00cc");
  const [currentIndexColor, setCurrentIndexColor] = useState<number | null>(null);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [strokeColor, setStrokeColor] = useState(shape?.stroke ?? "#131313")

  const handleShape = (e: Shape) => {
    if (shape)
      updateShape(shape.id, e);
  }

  useEffect(() => {
    if (shape && (shape?.dash !== dash || shape?.stroke !== strokeColor || shape?.strokeWidth !== stroke)) {
      handleShape({
        ...shape,
        dash: dash ?? undefined,
        strokeWidth: dash !== null ? stroke : 0,
        stroke: strokeColor
      });
    }

  }, [dash, stroke, strokeColor])

  useEffect(() => {
    if (shape && shape?.opacity !== ((opacity ?? 0) / 100))
      handleShape({
        ...shape,
        opacity: (opacity ?? 0) / 100
      });
  }, [opacity])

  useEffect(() => {
    if (shape && shape?.cornerRadius !== radius) {
      handleShape({
        ...shape,
        cornerRadius: radius
      });
    }

  }, [radius])

  useEffect(() => {
    if (shape && shape?.fontSize !== fontSize) {
      console.log('fontSize')
      handleShape({
        ...shape,
        fontSize: fontSize
      });
    }

  }, [fontSize])

  const applyGradient = (colors: string[]) => {
    const count = colors.length;
    const stops: (string | number)[] = [];
    colors.forEach((color, i) => {
      const stop = count === 1 ? 0 : i / (count - 1);
      stops.push(parseFloat(stop.toFixed(2)), color);
    });

    if (shape) {
      const width = shape.width / 1.25;
      const height = shape.height / 1.5;
      const angleInDeg = 90;
      const angle = ((180 - angleInDeg) / 180) * Math.PI;
      const length = Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle));
      const halfx = (Math.sin(angle) * length) / 2.0;
      const halfy = (Math.cos(angle) * length) / 2.0;
      const cx = width / 2.0;
      const cy = height / 2.0;
      const x1 = cx - halfx;
      const y1 = cy - halfy;
      const x2 = cx + halfx;
      const y2 = cy + halfy;

      updateShape(shape.id, {
        ...shape,
        fill: undefined,
        fillLinearGradientStartPoint: { x: x1, y: y1 },
        fillLinearGradientEndPoint: { x: x2, y: y2 },
        fillLinearGradientColorStops: stops
      });
    }
  }

  const handleText = (key: string, value: any) => {
    if (key === "fontUppercase") {
      // @ts-ignore
      handleShape({
        ...shape,
        text: value ? shape?.text?.toUpperCase() : shape?.text?.toLowerCase()
      });
    }
    // @ts-ignore
    handleShape({
      ...shape,
      [key]: value
    });
  }

  const textStyleOptions = [
    {
      icon: <VscBold size={25} />,
      isActive: (shape: any) => shape?.fontStyle === 'bold',
      toggle: (shape: any) => handleText('fontStyle', shape?.fontStyle === 'bold' ? 'normal' : 'bold'),
      key: 'bold'
    },
    {
      icon: <RxFontItalic size={25} />,
      isActive: (shape: any) => shape?.fontStyle === "italic",
      toggle: (shape: any) => handleText('fontStyle', shape?.fontStyle === "italic" ? 'normal' : 'italic'),
      key: 'italic',
    },
    {
      icon: <RxUnderline size={25} />,
      isActive: (shape: any) => shape?.textDecoration === 'underline',
      toggle: (shape: any) => handleText('textDecoration', shape?.textDecoration === 'underline' ? 'none' : 'underline'),
      key: 'underline',
    },
    {
      icon: <RxStrikethrough size={25} />,
      isActive: (shape: any) => shape?.textDecoration === 'line-through',
      toggle: (shape: any) => handleText('textDecoration', shape?.textDecoration === 'line-through' ? 'none' : 'line-through'),
      key: 'strikethrough',
    },
    {
      icon: <IoTextOutline size={25} />,
      isActive: (shape: any) => shape?.fontUppercase,
      toggle: (shape: any) => handleText('fontUppercase', !shape?.fontUppercase),
      key: 'uppercase',
    }
  ];


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
          if (shape) {
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
    <div className={`top-bar-menu ${shape ? 'mobile__topbar' : ''}`}>
      <RenderLeftOptions
        shape={shape}
        fontSize={fontSize}
        setFontSize={setFontSize}
        handleText={handleText}
        textStyleOptions={textStyleOptions}
        textEditSelcted={textEditSelcted}
        setTextEditSelcted={setTextEditSelcted}
      />
      {
        shape?.type === 'image' ?
          <IconButton variant="ghost" onClick={() => {
            handleChangeQuery(shape.id, 'replace_img');
          }}>
            <FiImage size={25} />
          </IconButton>
          : <></>
      }

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
                      if (shape)
                        handleShape({
                          ...shape,
                          fill: color,
                          fontColor: color
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
                      if (shape)
                        handleShape({
                          ...shape,
                          fill: color,
                          fontColor: color
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
      <Popover.Root>
        {
          shape?.type !== 'Text' ?
            <Popover.Trigger>
              <IconButton variant="ghost">
                <TbBorderCornerPill size={25} />
              </IconButton>
            </Popover.Trigger>
            : <></>
        }

        <Popover.Content width="360px">
          <Box flexGrow="1">
            <Flex gap="3" direction="row" justify="center" align="center">
              <Slider
                defaultValue={[0]}
                color="purple"
                value={[radius]}
                onValueChange={e => setRadius(e[0])}
                onChange={e => console.log(e.target)} />
              <input value={radius} onChange={e => {
                const _v = Number(e.target.value.replace(/[^0-9]/g, ''));
                setRadius(_v)
              }} className="input-small" type="text" inputMode="decimal" />
            </Flex>
          </Box>
        </Popover.Content>
      </Popover.Root>
      <Popover.Root>
        {
          shape?.type !== 'Text' ?
            <Popover.Trigger>
              <IconButton variant="ghost">
                <RxBorderWidth size={25} />
              </IconButton>
            </Popover.Trigger>
            : <></>
        }

        <Popover.Content width="300px">
          <Box flexGrow="1">
            <Flex mb={"4"} gap="2" direction="row" justify="center" align="center">
              {dashOptions.map((option, i) => {
                const isSelected = JSON.stringify(dash) === JSON.stringify(option.value);
                return (
                  <IconButton
                    key={i}
                    onClick={() => {
                      if (option.value === null) {
                        setStroke(0)
                      } else {
                        if (stroke === 0) {
                          setStroke(4)
                        }
                      }
                      setDash(option.value)
                    }}
                    variant="outline"
                    color={isSelected ? "purple" : "gray"}
                    aria-label={`Dash option ${i}`}
                  >
                    {option.icon}
                  </IconButton>
                );
              })}
            </Flex>
            <Text>Espessura do traço</Text>
            <Flex gap="3" direction="row" justify="center" align="center">
              <Slider
                defaultValue={[0]}
                color="purple"
                value={[stroke ?? 0]}
                onValueChange={e => {
                  if (e[0] > 0 && dash === null) {
                    setDash(dashOptions[1].value)
                  }
                  if (e[0] === 0 && dash !== null) {
                    setDash(undefined)
                  }
                  setStroke(e[0])
                }}
                onChange={e => console.log(e.target)} />
              <input value={stroke ?? 0} onChange={e => {
                const _v = Number(e.target.value.replace(/[^0-9]/g, ''));
                if (_v > 0 && dash === null) {
                  setDash(dashOptions[1].value)
                }
                if (_v === 0 && dash !== null) {
                  setDash(undefined)
                }
                setStroke(_v)
              }} className="input-small" type="text" inputMode="decimal" />
            </Flex>
            <Flex gap="3" direction="column" mt="3">
              <Text>Cor do traço</Text>
              <Chrome
                color={strokeColor}
                onChange={(newColor) => {
                  setStrokeColor(newColor.hex);
                }}
                className="custom-chrome-picker"
                showAlpha={false}
                // showHue={false}
                showEditableInput={false}
                showColorPreview={false}
              />
              <input
                style={{ width: 150 }} value={strokeColor} onChange={e => {
                  const _v = e.target.value
                  setStrokeColor(_v);

                }} className="input-small" type="text" inputMode="decimal" />
            </Flex>
          </Box>
        </Popover.Content>
      </Popover.Root>
      <Popover.Root>
        <Popover.Trigger>
          <IconButton variant="ghost">
            <RxTransparencyGrid size={25} />
          </IconButton>
        </Popover.Trigger>
        <Popover.Content width="360px">
          <Box flexGrow="1">
            <Text>Transparência</Text>
            <Flex gap="3" direction="row" justify="center" align="center">
              <Slider
                defaultValue={[1]}
                color="purple"
                value={[opacity ?? 0]}
                onValueChange={e => setOpacity(e[0])}
                min={0}
                max={100}
                onChange={e => console.log(e.target)} />
              <input value={opacity ?? 0} onChange={e => {
                const _v = Number(e.target.value.replace(/[^0-9]/g, ''));
                setOpacity(_v)
              }} className="input-small" type="text" inputMode="decimal" />
            </Flex>
          </Box>
        </Popover.Content>
      </Popover.Root>
      {/* <IconButton onClick={() => {
        if (shape) {
          // @ts-ignore
          updateShape(shape.id, {
            show: !shape.show
          })
        }
      }} variant="ghost">
        {shape?.show ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
      </IconButton> */}
      <IconButton onClick={() => {
        if (shape) {
          // @ts-ignore
          updateShape(shape.id, {
            draggable: !shape.draggable
          })
        }
      }} variant="ghost">
        {shape?.draggable ? <MdLockOutline size={22} /> : <MdLockOpen size={22} />}
      </IconButton>
      <div className="divider" style={{ height: 30 }} />
      {
        layersOptions.map(({ icon, value, action }, index) => (
          <IconButton key={index + 1} onClick={() => {
            if (action === 'bringToFront') {
              bringToFront(value)
              return
            }
            sendToBack(value)
          }} variant="ghost">
            {icon}
          </IconButton>
        ))
      }
    </div>
  )
}

export default TopBarMenu;


type TextStyleOption = {
  key: string;
  icon: JSX.Element;
  isActive: (shape: Shape) => boolean;
  toggle: (shape: Shape) => void;
};

type RenderLeftOptionsProps = {
  shape?: Shape;
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  handleText: (key: string, value: any) => void;
  textStyleOptions: TextStyleOption[];
  textEditSelcted: Shape | null;
  setTextEditSelcted(a: Shape | null): void;
};

const RenderLeftOptions = ({
  shape,
  fontSize,
  setFontSize,
  handleText,
  textStyleOptions,
  textEditSelcted,
  setTextEditSelcted
}: RenderLeftOptionsProps) => {
  if (shape?.type !== 'Text') return null;

  const [newText, setNewText] = useState("");

  useEffect(() => {
    if (newText) {
      handleText('text', newText)
    }
  }, [newText])

  useEffect(() => {
    if (textEditSelcted?.text)
      setNewText(textEditSelcted.text)
  }, [textEditSelcted])

  return (
    <>
      <Popover.Root>
        <Popover.Trigger>
          <Button variant="outline" color="gray">
            {fontSize.toFixed(0)}
          </Button>
        </Popover.Trigger>
        <Popover.Content>
          <input
            value={fontSize.toFixed(0)}
            onChange={e => {
              const _v = Number(e.target.value.replace(/[^0-9]/g, ''));
              if (typeof _v === 'number')
                setFontSize(_v);
            }}
            className="input-small"
            type="text"
            inputMode="decimal"
          />
          <Flex direction="column" gap={"2"} mt="2">
            {
              [12, 16, 24, 28, 48, 56, 64, 72, 80, 88, 88, 96, 104, 120, 144].map((value) => (
                <Button
                  onClick={() => setFontSize(value)}
                  variant="outline"
                  color={value === fontSize ? "violet" : "gray"}
                  key={value}>
                  {value}
                </Button>
              ))
            }
          </Flex>
        </Popover.Content>
      </Popover.Root>
      <Popover.Root>
        <Popover.Trigger>
          <Button variant="outline" color="gray">
            {shape?.fontFamily ?? "Poppins"}
          </Button>
        </Popover.Trigger>
        <Popover.Content>
          <Flex direction="column" p="2" gap="1">
            {fontOptions.map(font => (
              <Button
                key={font.value}
                variant="ghost"
                color="gray"
                onClick={() => handleText('fontFamily', font.value)}
                style={{ justifyContent: "space-between", padding: 10, gap: 5 }}
              >
                <Text style={{
                  fontFamily: font.value,
                  color: '#000'
                }} size={'2'}>
                  {font.label}
                </Text>
                {
                  shape?.fontFamily === font.value ? <FiCheck /> : <></>
                }
              </Button>
            ))}
          </Flex>
        </Popover.Content>
      </Popover.Root>
      <IconButton
        variant="ghost"
        color={textEditSelcted ? "purple" : "gray"}
        onClick={() => setTextEditSelcted(textEditSelcted ? null : shape)}
      >
        <FiEdit2 size={18} color={textEditSelcted ? "purple" : "gray"} />
      </IconButton>
      {textStyleOptions.map(({ icon, isActive, toggle, key }) => (
        <IconButton
          key={key}
          variant="ghost"
          color={isActive(shape) ? "purple" : "gray"}
          onClick={() => toggle(shape)}
        >
          {React.cloneElement(icon, { color: isActive(shape) ? "purple" : "gray" })}
        </IconButton>
      ))}
      <Popover.Root>
        <Popover.Trigger>
          <IconButton
            variant="ghost"
            color={"gray"}
          >
            {AligIcon[shape?.align ?? "left"]}
          </IconButton>
        </Popover.Trigger>
        <Popover.Content>
          <Flex direction="column" p="2" gap="2">
            {TextAlignItems.map(f => (
              <IconButton
                key={f.value}
                variant="ghost"
                color={shape.align === f.value ? "purple" : "gray"}
                onClick={() => handleText('align', f.value)}
              >
                {React.cloneElement(f.icon, { color: shape.align === f.value ? "purple" : "gray", size: 22 })}
              </IconButton>
            ))}
          </Flex>
        </Popover.Content>
      </Popover.Root>
      <div className="divider" style={{ height: 30 }} />
      {
        textEditSelcted ?
          <div style={{
            position: 'absolute',
            top: 80,
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 10,
            boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px'
          }}>
            <Grid justify='between' align={'center'} style={{ display: 'flex' }}>
              <div></div>
              <IconButton variant="ghost" onClick={() => {
                setTextEditSelcted(null)
              }}>
                <FiX />
              </IconButton>
            </Grid>
            <TextArea
              value={newText}
              onChange={e => {
                setNewText(e.target.value);
              }}
              onBlur={() => setTextEditSelcted(null)}
              autoFocus
              style={{ marginTop: 15 }}
              className="input"
              inputMode="text"
              rows={4}
            />
          </div>
          : <></>
      }

    </>
  );
};