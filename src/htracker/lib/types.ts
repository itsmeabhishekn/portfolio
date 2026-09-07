export type Habit = {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  archived: boolean;
  created_at: string;
};

export type Checkin = {
  habit_id: string;
  day: string;
  user_id: string;
  created_at: string;
};
