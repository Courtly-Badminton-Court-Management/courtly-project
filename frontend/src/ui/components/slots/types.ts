// /ui/components/slots/types.ts
export type SlotStatus = "open" | "closed" | "full";

export type Court = {
  id: string;
  label: string;
  available: boolean;
};

export type Slot = {
  id: string;
  time: string;
  status: SlotStatus;
  courts: Court[];
};

export type SlotMap = Record<string, Slot>;

export type DaySlotsData = {
  date: string;   // "DD-MM-YY"
  slotList: SlotMap;
};
