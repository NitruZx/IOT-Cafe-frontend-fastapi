import { useDisclosure } from "@mantine/hooks";
import { Modal, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

interface ModalProps {
  children: React.ReactNode;
  title: string;
  text: string;
}

export default function InputModal({ children, title, text }: ModalProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title={title}
        centered
      >
        <main>{children}</main>
      </Modal>

      <Button
        onClick={open}
        leftSection={<IconPlus />}
        size="xs"
        variant="primary"
        className="flex items-center space-x-2"
      >
        {text}
      </Button>
    </>
  );
}
