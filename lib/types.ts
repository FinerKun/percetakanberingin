export type ProductsProps = {
  id: number;
  name: string;
  price: number;
  description: string;
  img: string;
  stock: number;
  has_label: boolean;
  label: string[] | [];
  additional_img_url: string[] | [];
  additional_forms: string[] | [];
};

export type CartItemProps = {
  id: number;
  quantity: number;
  label: string;
};
