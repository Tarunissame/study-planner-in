import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { uid, unwrap } from "@/lib/data";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string | null;
  category: string;
  description: string;
};

export const EVENT_CATEGORIES = [
  "Mock test",
  "Coaching",
  "School exam",
  "Deadline",
  "Personal",
  "Revision",
  "Custom",
] as const;

export function useCalendarEvents() {
  return useQuery({
    queryKey: ["calendar-events"],
    queryFn: async (): Promise<CalendarEvent[]> => {
      const res = await supabase.from("calendar_events").select("*").order("date");
      return unwrap<CalendarEvent[]>(res as never);
    },
  });
}

export function useEventMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["calendar-events"] });

  const save = useMutation({
    mutationFn: async (v: {
      id?: string;
      title: string;
      date: string;
      time: string | null;
      category: string;
      description: string;
    }) => {
      const user_id = await uid();
      const row = {
        title: v.title,
        date: v.date,
        time: v.time || null,
        category: v.category,
        description: v.description,
      };
      if (v.id) {
        const { error } = await supabase.from("calendar_events").update(row).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("calendar_events").insert({ user_id, ...row });
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("calendar_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { save, remove };
}
