import { Swords, Shield, Gem, CookingPot, Feather, Axe, Pickaxe, Droplets, Leaf, ArrowUp, Zap, BookOpen, Skull } from 'lucide-react';
import type {
  CategoryApiResponse,
  ItemsApiResponse,
  ItemDetailApiResponse,
  GraphApiResponse
} from '@/types/osrs';
export const OSRS_CATEGORIES = [
  { id: 0, name: "Miscellaneous", icon: Feather },
  { id: 1, name: "Ammo", icon: ArrowUp },
  { id: 2, name: "Arrows", icon: ArrowUp },
  { id: 3, name: "Bolts", icon: ArrowUp },
  { id: 4, name: "Construction materials", icon: Axe },
  { id: 5, name: "Construction products", icon: Axe },
  { id: 6, name: "Cooking ingredients", icon: CookingPot },
  { id: 7, name: "Costumes", icon: Gem },
  { id: 8, name: "Crafting materials", icon: Gem },
  { id: 9, name: "Familiars", icon: Skull },
  { id: 10, name: "Farming produce", icon: Leaf },
  { id: 11, name: "Fletching materials", icon: Feather },
  { id: 12, name: "Food and Drink", icon: CookingPot },
  { id: 13, name: "Herblore materials", icon: Leaf },
  { id: 14, name: "Hunting equipment", icon: Swords },
  { id: 15, name: "Hunting Produce", icon: Leaf },
  { id: 16, name: "Jewellery", icon: Gem },
  { id: 17, name: "Mage armour", icon: Zap },
  { id: 18, name: "Mage weapons", icon: Zap },
  { id: 19, name: "Melee armour - low level", icon: Shield },
  { id: 20, name: "Melee armour - mid level", icon: Shield },
  { id: 21, name: "Melee armour - high level", icon: Shield },
  { id: 22, name: "Melee weapons - low level", icon: Swords },
  { id: 23, name: "Melee weapons - mid level", icon: Swords },
  { id: 24, name: "Melee weapons - high level", icon: Swords },
  { id: 25, name: "Mining and Smithing", icon: Pickaxe },
  { id: 26, name: "Potions", icon: Droplets },
  { id: 27, name: "Prayer armour", icon: BookOpen },
  { id: 28, name: "Prayer materials", icon: BookOpen },
  { id: 29, name: "Range armour", icon: ArrowUp },
  { id: 30, name: "Range weapons", icon: ArrowUp },
  { id: 31, name: "Runecrafting", icon: Zap },
  { id: 32, name: "Runes, Spells and Teleports", icon: Zap },
  { id: 33, name: "Seeds", icon: Leaf },
  { id: 34, name: "Summoning scrolls", icon: BookOpen },
  { id: 35, name: "Tools and containers", icon: Axe },
  { id: 36, name: "Woodcutting product", icon: Axe },
  { id: 37, name: "Pocket items", icon: Gem },
  // OSRS specific categories are limited, RS3 has more. OSRS only has one main category.
  // For OSRS, we use category=1 for everything.
  // The list above is for display purposes, but all API calls will use category=1 for OSRS.
];
export const OSRS_SINGLE_CATEGORY_ID = 1;
async function fetcher(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: 'Failed to parse error response' }));
    throw new Error(errorBody.error || `An error occurred while fetching the data: ${res.statusText}`);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'API returned an unsuccessful response.');
  }
  return json.data;
}
export const getCategory = async (id: number): Promise<CategoryApiResponse> =>
  fetcher(`/api/ge/category?id=${id}`);
export const getItems = async (id: number, alpha: string, page: number): Promise<ItemsApiResponse> =>
  fetcher(`/api/ge/items?id=${id}&alpha=${alpha}&page=${page}`);
export const getItemDetail = async (id: number): Promise<ItemDetailApiResponse> =>
  fetcher(`/api/ge/detail?id=${id}`);
export const getGraph = async (id: number): Promise<GraphApiResponse> =>
  fetcher(`/api/ge/graph?id=${id}`);