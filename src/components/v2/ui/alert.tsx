import { AlertDialog } from "radix-ui";
import * as React from "react";

interface AlertProp {
  children: React.ReactNode;
  title: string,
  description: string,
  buttonHandleAccept: () => void;
  buttonAcceptText?: string;
  cancelText?: string;
}

const Alert = (props: AlertProp) => (
  <AlertDialog.Root>
    <AlertDialog.Trigger asChild onClick={e => e.stopPropagation()}>
      {props.children}
    </AlertDialog.Trigger>
    <AlertDialog.Portal>
      <AlertDialog.Overlay onClick={e => e.stopPropagation()} className="inset-0 bg-[#00000099] data-[state=open]:animate-overlayShow w-screen h-screen top-0 absolute" />
      <AlertDialog.Content onClick={e => e.stopPropagation()} className="fixed animate-fade-in  z-[9999] rounded bg-background left-1/2 top-1/2 border-1  border-zinc-200 bg-zinc-200 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 bg-gray1 p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow">
        <AlertDialog.Title className="m-0 text-[17px] font-medium text-mauve12 text-black ">
          {props.title}
        </AlertDialog.Title>
        <AlertDialog.Description className="mb-5 mt-[15px] text-[15px] leading-normal text-black">
          {props.description}
        </AlertDialog.Description>
        <div className="flex justify-end gap-[25px]">
          <AlertDialog.Cancel asChild>
            <button onClick={(e) => e.stopPropagation()} className="inline-flex h-[35px] items-center justify-center rounded bg-mauve4 px-[15px] font-medium leading-none text-mauve11 outline-none outline-offset-1 hover:bg-mauve5 focus-visible:outline-2 focus-visible:outline-mauve7 select-none text-black ">
              {props?.cancelText ?? "Cancelar"}
            </button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <button onClick={(e) => {
              e.stopPropagation();
              props.buttonHandleAccept();
            }} className="inline-flex h-[35px] items-center justify-center rounded bg-red-500 px-[15px] font-medium leading-none text-red11 outline-none outline-offset-1 hover:bg-red5 focus-visible:outline-2 focus-visible:outline-red7 select-none">
              {props?.buttonAcceptText ?? "Continuar"}
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);

export default Alert;
