import useSWR from "swr";
import { Menu } from "../lib/models";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/layout";
import {
  Alert,
  Button,
  Container,
  Divider,
  NumberInput,
  TextInput,
  Textarea,
} from "@mantine/core";
import Loading from "../components/loading";
import { IconAlertTriangleFilled, IconTrash } from "@tabler/icons-react";
import { isNotEmpty, useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";

export default function MenuEditById() {
  const { menuId } = useParams();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);

  const { data: menu, isLoading, error } = useSWR<Menu>(`/menus/${menuId}`);
  const [isSetInitialValues, setIsSetInitialValues] = useState(false);

  const menuEditForm = useForm({
    initialValues: {
        menu_name: "",
        menu_description: "",
        menu_price: 0,
      },
  
      validate: {
        menu_name: isNotEmpty("กรุณาระบุชื่อเมนู"),
        menu_price: isNotEmpty("กรุณาระบุราคา"),
      },
  });

  const handleSubmit = async (values: typeof menuEditForm.values) => {
    try {
      setIsProcessing(true);
      await axios.patch(`/menus/${menuId}`, values);
      notifications.show({
        title: "แก้ไขเมนูสำเร็จ",
        message: "เมนูได้รับการแก้ไขเรียบร้อยแล้ว",
        color: "teal",
      });
      navigate(`/menus/${menuId}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          notifications.show({
            title: "ไม่พบเมนู",
            message: "ไม่พบเมนูที่ต้องการแก้ไข",
            color: "red",
          });
        } else if (error.response?.status === 422) {
          notifications.show({
            title: "ข้อมูลไม่ถูกต้อง",
            message: "กรุณาตรวจสอบข้อมูลที่กรอกใหม่อีกครั้ง",
            color: "red",
          });
        } else if (error.response?.status || 500 >= 500) {
          notifications.show({
            title: "เกิดข้อผิดพลาดบางอย่าง",
            message: "กรุณาลองใหม่อีกครั้ง",
            color: "red",
          });
        }
      } else {
        notifications.show({
          title: "เกิดข้อผิดพลาดบางอย่าง",
          message:
            "กรุณาลองใหม่อีกครั้ง หรือดูที่ Console สำหรับข้อมูลเพิ่มเติม",
          color: "red",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsProcessing(true);
      await axios.delete(`/menus/${menuId}`);
      notifications.show({
        title: "ลบเมนูสำเร็จ",
        message: "ลบเมนูนี้ออกจากระบบเรียบร้อยแล้ว",
        color: "red",
      });
      navigate("/menus");
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          notifications.show({
            title: "ไม่พบเมนู",
            message: "ไม่พบเมนูที่ต้องการลบ",
            color: "red",
          });
        } else if (error.response?.status || 500 >= 500) {
          notifications.show({
            title: "เกิดข้อผิดพลาดบางอย่าง",
            message: "กรุณาลองใหม่อีกครั้ง",
            color: "red",
          });
        }
      } else {
        notifications.show({
          title: "เกิดข้อผิดพลาดบางอย่าง",
          message:
            "กรุณาลองใหม่อีกครั้ง หรือดูที่ Console สำหรับข้อมูลเพิ่มเติม",
          color: "red",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isSetInitialValues && menu) {
      menuEditForm.setInitialValues(menu);
      menuEditForm.setValues(menu);
      setIsSetInitialValues(true);
    }
  }, [menu, menuEditForm, isSetInitialValues]);

  return (
    <>
      <Layout>
        <Container className="mt-8">
          <h1 className="text-xl">แก้ไขเมนู</h1>

          {isLoading && !error && <Loading />}
          {error && (
            <Alert
              color="red"
              title="เกิดข้อผิดพลาดในการอ่านข้อมูล"
              icon={<IconAlertTriangleFilled />}
            >
              {error.message}
            </Alert>
          )}

          {!!menu && (
            <>
              <form
                onSubmit={menuEditForm.onSubmit(handleSubmit)}
                className="space-y-8"
              >
                <TextInput
                  label="ชื่อเมนู"
                  placeholder="ชื่อเมนู"
                  {...menuEditForm.getInputProps("menu_name")}
                />

                <Textarea
                  label="รายละเอียดเมนู"
                  description="ใส่รายละเอียดของเมนู"
                  placeholder="รายละเอียดเมนู..."
                  {...menuEditForm.getInputProps("menu_description")}
                />

                <NumberInput
                  label="ราคา (บาท)"
                  placeholder="ราคา"
                  min={0}
                  {...menuEditForm.getInputProps("menu_price")}
                />

                <TextInput
                  label="รูปภาพเมนู (Url)"
                  placeholder="https://image.com"
                  {...menuEditForm.getInputProps("menu_image")}
                />

                <Divider />

                <div className="flex justify-between">
                  <Button
                    color="red"
                    leftSection={<IconTrash />}
                    size="xs"
                    onClick={() => {
                      modals.openConfirmModal({
                        title: "คุณต้องการลบเมนูนี้ใช่หรือไม่",
                        children: (
                          <span className="text-xs">
                            เมื่อคุณดำนเนินการลบเมนูนี้แล้ว
                            จะไม่สามารถย้อนกลับได้
                          </span>
                        ),
                        labels: { confirm: "ลบ", cancel: "ยกเลิก" },
                        onConfirm: () => {
                          handleDelete();
                        },
                        confirmProps: {
                          color: "red",
                        },
                      });
                    }}
                  >
                    ลบเมนู
                  </Button>

                  <Button type="submit" loading={isLoading || isProcessing}>
                    บันทึกข้อมูล
                  </Button>
                </div>
              </form>
            </>
          )}
        </Container>
      </Layout>
    </>
  );
}
