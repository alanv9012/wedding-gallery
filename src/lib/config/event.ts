import type { Event } from "@/types";

export type EventConfig = {
  activeEventSlug: string;
  activeEvent: Event;
};

export const eventConfig: EventConfig = {
  activeEventSlug: "Angelica-y-Roberto-2026",
  activeEvent: {
    id: "event-current",
    slug: "Angelica-y-Roberto-2026",
    title: "Dia de boda",
    date: "Sabado, 25 de abril, 2026",
    welcomeMessage:
      "Nos encanta que estés aquí. Por favor comparte tus momentos favoritos y disfruta de las fotos de todos en la celebración.",
    coverImageUrl: null,
  },
};
