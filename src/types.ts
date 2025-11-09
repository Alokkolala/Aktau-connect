
export type MapPoint = {
  id: string;
  name: string;
  description?: string;
  type: "событие" | "место" | "инициатива";
  lat: number;
  lng: number;
  author_id?: string;
  created_at?: string;
};

export type EventCounts = {
  likes: number;     // reaction = 1
  dislikes: number;  // reaction = -1
  userReaction?: 1 | -1 | 0; // реакция текущего пользователя (если известна)
};
