// ราคา mock ฝั่ง FE ต่อ 1 ช่องเวลา
export const FRONTEND_SLOT_PRICE_COINS = 100;

/** ใช้เผื่ออนาคตถ้าจะสลับไป dynamic ได้ง่าย */
export function getCellPriceCoins(): number {
  return FRONTEND_SLOT_PRICE_COINS;
}
