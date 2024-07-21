import Layout from "../components/layout";
import InputModal from "../components/inputmodal";
import cafeBackgroundImage from "../assets/images/bg-cafe-2.jpg";
import useSWR from "swr";
import { Book } from "../lib/models";
import Loading from "../components/loading";
import {
  Alert,
  Button,
  Checkbox,
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

export default function BooksPage() {
  const { data: books, error } = useSWR<Book[]>("/books");

  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);

  const bookCreateForm = useForm({
    initialValues: {
      title: "",
      author: "",
      year: 2024,
      is_published: false,
    },

    validate: {
      title: isNotEmpty("กรุณาระบุชื่อหนังสือ"),
      author: isNotEmpty("กรุณาระบุชื่อผู้แต่ง"),
      year: isNotEmpty("กรุณาระบุปีที่พิมพ์หนังสือ"),
    },
  });

  const handleSubmit = async (values: typeof bookCreateForm.values) => {
    try {
      setIsProcessing(true);
      const response = await axios.post<Book>(`/books`, values);
      notifications.show({
        title: "เพิ่มข้อมูลหนังสือสำเร็จ",
        message: "ข้อมูลหนังสือได้รับการเพิ่มเรียบร้อยแล้ว",
        color: "teal",
      });
      navigate(`/books/${response.data.id}`);
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
          <h1 className="text-5xl mb-2">หนังสือ</h1>
          <h2>รายการหนังสือทั้งหมด</h2>
        </section>

        <section className="container mx-auto py-8">
          <div className="flex justify-between">
            <h1>รายการหนังสือ</h1>

            <InputModal text="เพิ่มหนังสือ">
              <form
                onSubmit={bookCreateForm.onSubmit(handleSubmit)}
                className="space-y-8"
              >
                <TextInput
                  label="ชื่อหนังสือ"
                  placeholder="ชื่อหนังสือ"
                  {...bookCreateForm.getInputProps("title")}
                />

                <TextInput
                  label="ชื่อผู้แต่ง"
                  placeholder="ชื่อผู้แต่ง"
                  {...bookCreateForm.getInputProps("author")}
                />

                <Textarea
                  label="รายละเอียดหนังสือ"
                  description="ใส่รายละเอียดของหนังสือ"
                  placeholder="รายละเอียดหนังสือ..."
                  {...bookCreateForm.getInputProps("description")}
                />

                <Textarea
                  label="เรื่องย่อ"
                  description="ใส่เนื้อเรื่องย่อ"
                  placeholder="เรื่องราวมันเริ่มเมื่อตอนที่พบเครื่องมือเอเลี่ยนประหลาด..."
                  autosize
                  minRows={2}
                  {...bookCreateForm.getInputProps("synopsis")}
                />

                <NumberInput
                  label="ปีที่พิมพ์"
                  placeholder="ปีที่พิมพ์"
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  {...bookCreateForm.getInputProps("year")}
                />

                {/* TODO: เพิ่มรายละเอียดหนังสือ */}
                {/* TODO: เพิ่มเรื่องย่อ */}
                {/* TODO: เพิ่มหมวดหมู่(s) */}

                <Checkbox
                  label="เผยแพร่"
                  {...bookCreateForm.getInputProps("is_published", {
                    type: "checkbox",
                  })}
                />

                <TextInput
                  label="Url รูปภาพ"
                  placeholder="https://image.com"
                  {...bookCreateForm.getInputProps("image_url")}
                />

                <Divider />

                <Button type="submit" loading={isProcessing}>
                  บันทึกข้อมูล
                </Button>
              </form>
            </InputModal>
          </div>

          {!books && !error && <Loading />}
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
            {books?.map((book) => (
              <div
                className="border border-solid border-neutral-200"
                key={book.id}
              >
                <img
                  src={book.image_url ? book.image_url : "https://placehold.co/150x200"}
                  alt={book.title}
                  className="w-full object-cover aspect-[3/4]"
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold line-clamp-2">
                    {book.title}
                  </h2>
                  <p className="text-xs text-neutral-500">โดย {book.author}</p>
                </div>

                <div className="flex justify-end px-4 pb-2">
                  <Button
                    component={Link}
                    to={`/books/${book.id}`}
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
