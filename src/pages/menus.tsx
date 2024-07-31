import Layout from "../components/layout";
import InputModal from "../components/inputmodal";
import cafeBackgroundImage from "../assets/images/coffee-menu.jpeg";
import { useDisclosure } from "@mantine/hooks";
import useSWR from "swr";
import { Menu, Order } from "../lib/models";
import Loading from "../components/loading";
import {
  Alert,
  Button,
  Divider,
  NumberInput,
  TextInput,
  Textarea,
  Drawer,
  ScrollArea,
  Modal,
} from "@mantine/core";
import {
  IconAlertTriangleFilled,
  IconShoppingCartFilled,
  IconShoppingCart,
  IconTrashXFilled,
  IconEdit,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { isNotEmpty, useForm, hasLength } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import axios, { AxiosError } from "axios";

interface CartItem {
  menu_id: number;
  menu_name: string;
  quantity: number;
  menu_option?: string;
}

export default function MenusPage() {
  const { data: menus, error } = useSWR<Menu[]>("/menus");
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartOpened, { open: cartOpen, close: cartClose }] =
    useDisclosure(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const getMenu = (menu_id: number) =>
    menus?.find((menu) => menu.menu_id === menu_id);

  const [currentOption, setCurrentOption] = useState<{ [key: number]: string }>(
    {}
  );
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

  const orderSubmitForm = useForm({
    initialValues: {
      order_name: "",
      order_tel: "",
      validate: {
        order_name: isNotEmpty("กรุณาระบุชื่อลูกค้า"),
        order_tel: hasLength(
          { min: 10, max: 10 },
          "กรุณาระบุเบอร์โทรศัพท์ลูกค้า"
        ),
      },
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

  const handleOrderSubmit = async (values: typeof orderSubmitForm.values) => {
    try {
      setIsProcessing(true);
      const totalAmount = cartItems.reduce(
        (total, item) =>
          total + (getMenu(item.menu_id)?.menu_price ?? 0) * item.quantity,
        0
      );
      const order: Order = {
        order_id: undefined,
        order_name: values.order_name,
        order_tel: values.order_tel,
        order_item: JSON.stringify(cartItems),
        total_price: totalAmount,
      };
      await axios.post("/orders", order);
      setCartItems([]);
      localStorage.removeItem("cart");

      notifications.show({
        title: "Order placed successfully",
        message: "Your order has been placed.",
        color: "teal",
      });
    } catch (error) {
      notifications.show({
        title: "Error placing order",
        message: "There was an error placing your order. Please try again.",
        color: "red",
      });
    } finally {
      orderSubmitForm.values.order_name = "";
      orderSubmitForm.values.order_tel = "";
      setIsProcessing(false);
    }
  };

  const handleAddToCart = (menu: Menu) => {
    const itemExists = cartItems.some((item) => item.menu_id === menu.menu_id);
    if (itemExists) {
      notifications.show({
        title: "รายการมีอยู่ในตะกร้าแล้ว",
        message: "คุณได้เพิ่มรายการนี้ไปยังตะกร้าแล้ว",
        color: "yellow",
      });
      return;
    }
    const updatedCart = [
      ...cartItems,
      {
        menu_id: menu.menu_id,
        menu_name: menu.menu_name,
        quantity: 1,
      },
    ];
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    notifications.show({
      title: "เพิ่มลงตะกร้าสำเร็จ",
      message: "ได้เพิ่มเมนูลงตะกร้าเรียบร้อยแล้ว",
      color: "teal",
    });
  };

  const handleQuantityChange = (menuId: number, value: number | undefined) => {
    if (value === undefined || value <= 0) {
      handleRemoveFromCart(menuId);
    } else {
      const updatedCart = cartItems.map((item) =>
        item.menu_id === menuId ? { ...item, quantity: value } : item
      );
      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  const handleSaveOption = () => {
    if (editingItem) {
      setCartItems((prevItems) =>
        prevItems.map((item) => {
          if (item.menu_id === editingItem.menu_id) {
            if (currentOption[editingItem.menu_id]) {
              item["menu_option"] = currentOption[editingItem.menu_id];
            } else {
              delete item["menu_option"];
              delete currentOption[editingItem.menu_id]
            }
            return item;
          }
          return item;
        })
      );
      closeModal();
    }
  };

  const handleRemoveFromCart = (menuId: number) => {
    const updatedCart = cartItems.filter((item) => item.menu_id !== menuId);
    delete currentOption[menuId]
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleOptionChange = (menu_id: number, option: string) => {
    setCurrentOption((prevOptions) => ({
      ...prevOptions,
      [menu_id]: option,
    }));
  };

  const openModal = (item: CartItem) => {
    setEditingItem(item);
    setModalOpened(true);
  };

  const closeModal = () => {
    setModalOpened(false);
    setEditingItem(null);
  };

  return (
    <>
      <Drawer
        position="right"
        offset={8}
        radius="md"
        opened={cartOpened}
        onClose={cartClose}
        title="ตะกร้า"
      >
        <Divider />
        <div className="flex flex-col justify-between h-[89vh]">
          <ScrollArea type="auto">
            <div className="flex flex-col gap-3 pt-2 h-full">
              {cartItems.length === 0 ? (
                <p className="text-gray-500 py-2">ตะกร้าของคุณว่างเปล่า</p>
              ) : (
                cartItems.map((item) => (
                  <div className="flex gap-3" key={item.menu_id}>
                    <img
                      src={
                        getMenu(item.menu_id)?.menu_image
                          ? getMenu(item.menu_id)?.menu_image
                          : "https://placehold.co/150x200"
                      }
                      alt={getMenu(item.menu_id)?.menu_name}
                      className="size-32 rounded-xl object-cover"
                    />
                    <div className="flex gap-3">
                      <div className="flex flex-col gap-2">
                        <p className="font-bold">
                          {getMenu(item.menu_id)?.menu_name}
                        </p>
                        <p className="indent-3 text-sm">
                          {(getMenu(item.menu_id)?.menu_price ?? 0) *
                            item.quantity}{" "}
                          บาท
                        </p>

                        <div className="flex gap-2">
                          <NumberInput
                            value={item.quantity}
                            onChange={(value) => {
                              const numericValue =
                                typeof value === "string"
                                  ? parseFloat(value)
                                  : value;
                              handleQuantityChange(item.menu_id, numericValue);
                            }}
                            min={1}
                            size="xs"
                          />
                          <Button
                            size="xs"
                            color="red"
                            onClick={() => handleRemoveFromCart(item.menu_id)}
                          >
                            {<IconTrashXFilled />}
                          </Button>
                          <Button size="xs" onClick={() => openModal(item)}>
                            {<IconEdit />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="flex flex-col gap-3">
            <Divider />
            {cartItems && cartItems.length > 0 ? (
              <>
                <p className="text-lg">
                  รวมเงินทั้งหมด{" "}
                  {cartItems
                    .map(
                      (item) =>
                        (getMenu(item.menu_id)?.menu_price ?? 0) * item.quantity
                    )
                    .reduce((a, b) => a + b, 0)}{" "}
                  บาท
                </p>
                <form
                  onSubmit={orderSubmitForm.onSubmit(handleOrderSubmit)}
                  className="space-y-4 flex flex-col"
                >
                  <TextInput
                    label="ชื่อลูกค้า"
                    description="ชื่อจริงหรือชื่อเล่นก็ได้"
                    {...orderSubmitForm.getInputProps("order_name")}
                  />
                  <TextInput
                    label="เบอร์โทรศัพท์ลูกค้า"
                    placeholder="08XXXXXXXX"
                    {...orderSubmitForm.getInputProps("order_tel")}
                  />
                  <Button type="submit" loading={isProcessing} variant="filled">
                    ส่งรายการ
                  </Button>
                </form>

                {/* {JSON.stringify(cartItems)} */}
                
              </>
            ) : (
              "กรุณาเพิ่มเมนูลงในตะกร้าก่อน"
            )}
            {/* {JSON.stringify(currentOption)} */}
          </div>
        </div>
      </Drawer>
      <Modal opened={modalOpened} onClose={closeModal} title="ระบุรายละเอียด">
        {editingItem && (
          <div>
            <Textarea
              placeholder="หวานฉ่ำๆ น้ำตาลล้นแก้ว"
              description="บอกมาสิ ว่าชอบแบบไหน"
              value={currentOption[editingItem.menu_id] || ""}
              onChange={(e) =>
                handleOptionChange(editingItem.menu_id, e.target.value)
              }
            />
            <Button onClick={handleSaveOption} mt="md">
              บันทึก
            </Button>
          </div>
        )}
      </Modal>
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

            <div className="flex justify-self-end gap-2">
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
              <Button
                onClick={cartOpen}
                size="xs"
                variant="primary"
                leftSection={<IconShoppingCart />}
              >
                ดูตะกร้า {cartItems.length ? "(" + cartItems.length + ")" : ""}
              </Button>
            </div>
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
                  draggable="false"
                  src={
                    menu.menu_image
                      ? menu.menu_image
                      : "https://placehold.co/150x200"
                  }
                  alt={menu.menu_name}
                  className="w-full object-cover aspect-[3/3] select-none"
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold line-clamp-2">
                    {menu.menu_name}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    ราคา {menu.menu_price} บาท
                  </p>
                </div>

                <div className="flex justify-end px-4 pb-2 gap-2">
                  <Button
                    color="orange"
                    size="xs"
                    variant="outline"
                    rightSection={<IconShoppingCartFilled />}
                    onClick={() => handleAddToCart(menu)}
                  >
                    ใส่ตะกร้า
                  </Button>
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
