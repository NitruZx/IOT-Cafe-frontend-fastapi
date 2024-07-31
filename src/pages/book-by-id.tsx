import { Alert, Badge, Button, Container, Divider } from "@mantine/core";
import Layout from "../components/layout";
import { Link, useParams } from "react-router-dom";
import { Book } from "../lib/models";
import useSWR from "swr";
import Loading from "../components/loading";
import {
  IconAlertTriangleFilled,
  IconEdit,
  IconArrowLeft,
} from "@tabler/icons-react";

export default function BookByIdPage() {
  const { bookId } = useParams();

  const { data: book, isLoading, error } = useSWR<Book>(`/books/${bookId}`);

  return (
    <>
      <Layout>
        <Container className="mt-4">
          {/* You can use isLoading instead of !book */}
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

          {!!book && (
            <>
              <div className="flex justify-between">
                <h1>{book.title}</h1>
                <Button
                  variant="outline"
                  radius="lg"
                  component={Link}
                  to={`/books`}
                  leftSection={<IconArrowLeft />}
                >
                  ย้อนกลับ
                </Button>
              </div>
              <p className="italic text-neutral-500 mb-4">โดย {book.author}</p>
              <div className="grid grid-cols-1 lg:grid-cols-3">
                <img
                  draggable="false"
                  src={
                    book.image_url
                      ? book.image_url
                      : "https://placehold.co/150x200"
                  }
                  alt={book.title}
                  className="w-full object-cover aspect-[3/4] rounded-xl select-none"
                />
                <div className="col-span-2 px-4 space-y-2 py-4">
                  <h3>รายละเอียดหนังสือ</h3>
                  <p className="indent-4">
                    {/* TODO: เพิ่มรายละเอียดหนังสือ */}
                    {book.description ? (
                      book.description
                    ) : (
                      <p className="text-gray-300 text-sm">
                        ไม่มีรายละเอียดหนังสือ
                      </p>
                    )}
                  </p>

                  <h3>เรื่องย่อ</h3>
                  <p className="indent-4">
                    {/* TODO: เพิ่มเรื่องย่อ */}
                    {book.synopsis ? (
                      book.synopsis
                    ) : (
                      <p className="text-gray-300 text-sm">
                        ไม่มีการใส่เรื่องย่อ
                      </p>
                    )}
                  </p>

                  <h3>หมวดหมู่</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.category?.split(",").map((category) => (
                      <Badge color="teal">{category}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Divider className="mt-4" />

              <Button
                color="blue"
                size="xs"
                component={Link}
                to={`/books/${book.id}/edit`}
                className="mt-4"
                leftSection={<IconEdit />}
              >
                แก้ไขข้อมูลหนังสือ
              </Button>
            </>
          )}
        </Container>
      </Layout>
    </>
  );
}
