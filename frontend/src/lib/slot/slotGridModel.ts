

// View-model สำหรับ UI
export type Col = { start: string; end: string; label: string };

// เพิ่ม priceCoins เพื่อไว้แสดง/ตรวจสอบใน UI ถ้าจำเป็น
export type GridCell = {
  status: string;
  priceCoins?: number;
  /** ✅ เพิ่ม id ของ slot แต่ละช่อง */
  id?: string;
};

// สำหรับการเลือกในกริด
export type SelectedSlot = {
  courtRow: number;
  colIdx: number;
  slotId?: string; // ✅ เพิ่ม field นี้
};

// กลุ่ม selection (ช่วงเวลาต่อเนื่องในแถวเดียวกัน)
export type GroupedSelection = {
  courtRow: number;
  startIdx: number;
  endIdx: number;
  slots: number;
  /** sum ของราคาในช่วงนั้น จาก priceGrid */
  price: number;
  timeLabel: string;
  
};

// matrix ราคา (rows x cols) ให้ index ด้วย [row][col]
export type PriceGrid = number[][];

export type ManagerSelectedSlot = SelectedSlot & {
  slotId?: string;
};
