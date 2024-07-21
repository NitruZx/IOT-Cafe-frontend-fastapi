import { useDisclosure } from "@mantine/hooks";
import { Modal, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

interface ModalProps {
  children: React.ReactNode;
  text: string;
}

export default function InputModal({ children, text }: ModalProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="เพิ่มหนังสือในระบบ"
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
