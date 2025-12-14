export interface Alpha {
  letter: string;
  items: number;
}
export interface CategoryApiResponse {
  types: any[];
  alpha: Alpha[];
}
export interface PriceInfo {
  trend: 'neutral' | 'positive' | 'negative';
  price: string | number;
}
export interface Item {
  icon: string;
  icon_large: string;
  id: number;
  type: string;
  typeIcon: string;
  name: string;
  description: string;
  current: PriceInfo;
  today: PriceInfo;
  members: string;
}
export interface ItemsApiResponse {
  total: number;
  items: Item[];
}
export interface ItemDetail {
  icon: string;
  icon_large: string;
  id: number;
  type: string;
  typeIcon: string;
  name: string;
  description: string;
  current: PriceInfo;
  today: PriceInfo;
  members: string;
  day30: { trend: string; change: string };
  day90: { trend: string; change: string };
  day180: { trend: string; change: string };
}
export interface ItemDetailApiResponse {
  item: ItemDetail;
}
export interface GraphData {
  daily: { [timestamp: string]: number };
  average: { [timestamp: string]: number };
}
export interface GraphApiResponse extends GraphData {}