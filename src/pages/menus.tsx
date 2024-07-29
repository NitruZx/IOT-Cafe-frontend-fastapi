import Layout from "../components/layout";
import InputModal from "../components/inputmodal";
import cafeBackgroundImage from "../assets/images/bg-cafe-2.jpg";
import useSWR from "swr";
import { Menu } from "../lib/models";
import Loading from "../components/loading";
import {
  Alert,
  Button,
  Divider,
  NumberInput,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconAlertTriangleFilled } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { isNotEmpty, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import axios, { AxiosError } from "axios";
export default function MenusPage() {
  const { data: menus, error } = useSWR<Menu[]>("/menus");

  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);

  const menuCreateForm = useForm({
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

  const handleSubmit = async (values: typeof menuCreateForm.values) => {
    try {
      setIsProcessing(true);
      const response = await axios.post<Menu>(`/menus`, values);
      notifications.show({
        title: "เพิ่มเมนูสำเร็จ",
        message: "ได้เพิ่มเมนูเรียบร้อยแล้ว",
        color: "teal",
      });
      navigate(`/menus/${response.data.menu_id}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 422) {
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

  return (
    <>
      <Layout>
        <section
          className="h-[500px] w-full text-white bg-orange-800 bg-cover bg-blend-multiply flex flex-col justify-center items-center px-4 text-center"
          style={{
            backgroundImage: `url(${cafeBackgroundImage})`,
          }}
        >
          <h1 className="text-5xl mb-2">เมนูเครื่องดื่ม</h1>
          <h2>รายการเมนูทั้งหมด</h2>
        </section>

        <section className="container mx-auto py-8">
          <div className="flex justify-between pb-5">
            <h1>รายการเมนู</h1>

            <InputModal text="เพิ่มเมนู" title="เพิ่มเมนูในระบบ">
              <form
                onSubmit={menuCreateForm.onSubmit(handleSubmit)}
                className="space-y-8"
              >
                <TextInput
                  label="ชื่อเมนู"
                  placeholder="ชื่อเมนู"
                  {...menuCreateForm.getInputProps("menu_name")}
                />

                <Textarea
                  label="รายละเอียดเมนู"
                  description="ใส่รายละเอียดของเมนู"
                  placeholder="รายละเอียดเมนู..."
                  {...menuCreateForm.getInputProps("menu_description")}
                />

                <NumberInput
                  label="ราคา (บาท)"
                  placeholder="ราคา"
                  min={0}
                  {...menuCreateForm.getInputProps("menu_price")}
                />

                <TextInput
                  label="รูปภาพเมนู (Url)"
                  placeholder="https://image.com"
                  {...menuCreateForm.getInputProps("menu_image")}
                />

                <Divider />

                <Button type="submit" loading={isProcessing}>
                  บันทึกข้อมูล
                </Button>
              </form>
            </InputModal>
          </div>

          {!menus && !error && <Loading />}
          {error && (
            <Alert
              color="red"
              title="เกิดข้อผิดพลาดในการอ่านข้อมูล"
              icon={<IconAlertTriangleFilled />}
            >
              {error.message}
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {menus?.map((menu) => (
              <div
                className="border border-solid border-neutral-200"
                key={menu.menu_id}
              >
                <img
                  src={
                    menu.menu_image
                      ? menu.menu_image
                      : "https://placehold.co/150x200"
                  }
                  alt={menu.menu_name}
                  className="w-full object-cover aspect-[3/3]"
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold line-clamp-2">
                    {menu.menu_name}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    โดย {menu.menu_description}
                  </p>
                </div>

                <div className="flex justify-end px-4 pb-2">
                  <Button
                    component={Link}
                    to={`/menus/${menu.menu_id}`}
                    size="xs"
                    variant="default"
                  >
                    ดูรายละเอียด
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Layout>
    </>
  );
}
