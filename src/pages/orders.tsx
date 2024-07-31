import Layout from "../components/layout";
import cafeBackgroundImage from "../assets/images/coffee-menu.jpeg";
import useSWR, { mutate } from "swr";
import { Order } from "../lib/models";
import { Button, Table, Group, Accordion, ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import axios from "axios";

interface OrderItem {
  menu_id: number;
  menu_name: string;
  quantity: number;
  menu_option: string;
}

export default function OrdersPage() {
  const { data: orders } = useSWR<Order[]>("/orders");

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/orders/${id}`);
      notifications.show({
        title: "Success",
        message: "Order deleted successfully",
        color: "green",
      });
      mutate("/orders");
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete order",
        color: "red",
      });
    }
  };

  const rows = orders?.map((row) => {
    const orderItems: OrderItem[] = JSON.parse(row.order_item);

    return (
      <Accordion.Item value={String(row.order_id)} key={row.order_id}>
        <Accordion.Control>
          <div className="flex gap-4 justify-between">
            <div className="w-1/3">
              <b>#Q{row.order_id}</b>
            </div>
            <div className="w-1/3">{row.order_name}</div>
            <div className="w-1/3">${row.total_price}</div>
            <ActionIcon size="lg" variant="subtle" color="gray">
              <Group>
                <Button
                  variant="subtle"
                  size="xs"
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row.order_id ?? 0);
                  }}
                >
                  <IconTrash className="w-4 h-4" />
                </Button>
              </Group>
            </ActionIcon>
          </div>
        </Accordion.Control>
        <Accordion.Panel>
          <div className="text-sm text-gray-500">
            <Table className="min-w-full">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ชื่อเมนู</Table.Th>
                  <Table.Th>จำนวน</Table.Th>
                  <Table.Th>หมายเหตุ</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {orderItems.map((item) => (
                  <Table.Tr key={item.menu_id}>
                    <Table.Td>{item.menu_name}</Table.Td>
                    <Table.Td>{item.quantity}</Table.Td>
                    <Table.Td>{item.menu_option}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    );
  });

  return (
    <>
      <Layout>
      <section
          className="h-[500px] w-full text-white bg-orange-800 bg-cover bg-blend-multiply flex flex-col justify-center items-center px-4 text-center"
          style={{
            backgroundImage: `url(${cafeBackgroundImage})`,
          }}
        >
          <h1 className="text-5xl mb-2">รายการ Order</h1>
          <h2>รายการสั่งอาหารและเครื่องดื่มทั้งหมด</h2>
        </section>
        <section className="container mx-auto py-8">
          <div className="flex justify-between flex-col gap-3 p-10 rounded-md bg-neutral-50">
            <h1>Orders</h1>
            { orders && orders?.length > 0 ? (
              <Accordion variant="contained" radius="md" chevronPosition="left" multiple>
              {rows}
            </Accordion>
            ) : ("ยังไม่มีรายการสั่งเมนู")}
          </div>
        </section>
      </Layout>
    </>
  );
}
