import { Alert, Button, Container, Divider } from "@mantine/core";
import Layout from "../components/layout";
import { Link, useParams } from "react-router-dom";
import { Menu } from "../lib/models";
import useSWR from "swr";
import Loading from "../components/loading";
import { IconAlertTriangleFilled, IconEdit } from "@tabler/icons-react";

export default function MenuByIdPage() {
  const { menuId } = useParams();

  const { data: menu, isLoading, error } = useSWR<Menu>(`/menus/${menuId}`);

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

          {!!menu && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3">
                <img
                  src={
                    menu.menu_image
                      ? menu.menu_image
                      : "https://placehold.co/150x200"
                  }
                  alt={menu.menu_image}
                  className="w-full object-cover aspect-[3/4]"
                />
                <div className="col-span-2 px-4 space-y-2 py-4">
                  <h1>{menu.menu_name}</h1>
                  <h3>ราคา</h3>
                  <p className="indent-4">
                    {menu.menu_price} บาท
                  </p>
                  <h3>รายละเอียด</h3>
                  <p className="indent-4">
                    {/* TODO: เพิ่มรายละเอียดหนังสือ */}
                    {menu.menu_description ? (
                      menu.menu_description
                    ) : (
                      <p className="text-gray-300 text-sm">
                        ไม่มีรายละเอียดเมนู
                      </p>
                    )}
                  </p>
                </div>
              </div>

              <Divider className="mt-4" />

              <Button
                color="blue"
                size="xs"
                component={Link}
                to={`/menus/${menu.menu_id}/edit`}
                className="mt-4"
                leftSection={<IconEdit />}
              >
                แก้ไขข้อมูลเมนู
              </Button>
            </>
          )}
        </Container>
      </Layout>
    </>
  );
}
