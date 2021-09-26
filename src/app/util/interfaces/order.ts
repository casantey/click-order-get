export interface Order {
  orderSource: string;
  phone: string;
  name: string;
  email: string;
  itemCategory: string;
  itemName: string;
  itemPrice: number;
  itemFlavors: string;
  item_quantity: number;
  deliveryAddress: string;
  dateCreated: string;
  orderLong: number;
  orderLat: number;
  clientReference: string;
  orderStatus: string;
  orderNo: string;
  orderStatusId?: number;
  selectedPrice?: number;
  institution?: string;
  place?: string;
  region?: string;
  delivery_agent?: string;
  delivery_agent_name?: string;
}
