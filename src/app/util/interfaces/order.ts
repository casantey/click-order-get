export interface Order {
  orderSource: string;
  phone: string;
  name: string;
  email: string;
  itemCategory: string;
  itemName: string;
  itemPrice: number;
  itemFlavors: string;
  itemQuantity: number;
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
  deliveryAgent?: string;
  deliveryAgentName?: string;
}
