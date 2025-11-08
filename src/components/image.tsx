import { Button, Dialog, Flex, Text as RadixText, TextArea } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { EventsService } from '../services/events';
import { ToolsService } from '../services/tools';

const MagicImage = (props: { open: boolean, handleOpen: VoidFunction; selectImage: (link: string) => void }) => {
  const { handleOpen, open, selectImage } = props;
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [eventId, setEventId] = useState<string | null>(null);

  const generateImage = () => {
    setLoading(true);
    ToolsService.generateImage(description).then(res => {
      if (res?.data?.id) {
        setEventId(res.data.id)
      }
    }).finally(() => setLoading(false));
  }

  useEffect(() => {
    if (eventId) {
      const interval = setInterval(() => {
        EventsService.consult("generate-image", eventId ?? "")
          .then(({ data }) => {
            if (data?.status) {
              if (data.status === 0) {
                clearInterval(interval);
                toast.error("Não foi possível gerar imagem.")
                setLoading(false);
                return
              }
              if (data.status === 4 && data.metadata?.[0].id) {
                ToolsService.findMaterial(data.metadata?.[0].id)
                  .then((response) => {
                    setEventId(null);
                    if (response?.data?.content) {
                      setImageUrl(response.data.content as string)
                    }
                    clearInterval(interval);
                  })
              }
            }
          })
          .catch((err) => {
            toast.error(err?.response?.data?.message ?? "Não foi possível gerar imagem");
            setLoading(false);
          })
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [eventId]);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpen}>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Descreva a imagem</Dialog.Title>
        <Flex direction="column" gap="3">
          <label>
            <RadixText as="div" size="1" color="gray">
              Um gerador de imagens a partir de texto que lhe oferece infinitos resultados
            </RadixText>
            {
              imageUrl ?
                <img src={imageUrl} alt="Generated" style={{ width: '100%', marginTop: 10, borderRadius: 8 }} />
                :
                <TextArea
                  mt="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição da imagem"
                  style={{ width: '100%' }}
                  color="purple"
                  rows={4}
                />
            }

          </label>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Fechar
            </Button>
          </Dialog.Close>
          <Button
            onClick={imageUrl ? () => selectImage(imageUrl) : generateImage}
            disabled={loading} loading={loading} color="purple">{imageUrl ? "Usar esta image" : "Gerar image"}</Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default MagicImage;