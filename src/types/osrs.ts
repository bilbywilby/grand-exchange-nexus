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
export type GraphApiResponse = GraphData;
export interface FlipOpportunity {
  id: number;
  name: string;
  buy_price: number;
  sell_price: number;
  profit_per_item_gp: number;
  buy_limit: number;
  volume_24h: number;
  total_potential_profit_gp: number;
}
export interface FlipOpportunitiesResponse {
  data: FlipOpportunity[];
}