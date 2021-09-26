import { Product } from './product';

export interface Vendor {
  vendorId: string;
  vendorName: string;
  vendorDescription: string;
  vendorLogo: string;
  vendorPhone: string;
  vendorEmail: string;
  vendorStatus: boolean;
  latitude: number;
  longitude: number;
  dateAdded: string;
  products?: Product[];
}
