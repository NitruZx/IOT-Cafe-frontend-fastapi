export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  is_published: boolean;
  description: string;
  synopsis: string;
  image_url: string;
  category: string;
}

export interface Menu {
  menu_id: number;
  menu_name: string;
  menu_description: string;
  menu_price: number;
  menu_image: string;
}

export interface Order {
  order_id: number | undefined;
  order_name: string;
  order_tel: string;
  order_item: string;
  total_price: number;
  order_on: string | undefined;
}
