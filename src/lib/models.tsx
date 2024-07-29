export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  is_published: boolean;
  description: string;
  synopsis: string;
  image_url: string;
}

export interface Menu {
  menu_id: number;
  menu_name: string;
  menu_description: string;
  menu_price: number;
  menu_image: string;
}
