import { useQueryClient } from "@tanstack/react-query";
import { useBookingsCreateCreate} from "@/api-client/endpoints/bookings/bookings";

type Item = { court: number; date: string; start: string; end: string };

export function useCreateBookings() {
  const qc = useQueryClient();

  const mutation = useBookingsCreateCreate({
    mutation: {
      onSuccess: () => {
        // รีเฟรช cache หลัก ๆ: wallet + slots
        qc.invalidateQueries({ queryKey: ["wallet"] }).catch(() => {});
        qc.invalidateQueries({ queryKey: ["slots"] }).catch(() => {});
      },
    },
  }) as unknown as {
    mutateAsync: (body: { club: number; items: Item[] }) => Promise<any>;
    isPending: boolean;
  };

  return {
    create: (clubId: number, items: Item[]) => mutation.mutateAsync({ club: clubId, items }),
    isCreating: (mutation as any).isPending,
  };
}
