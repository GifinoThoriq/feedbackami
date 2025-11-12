export interface IPost {
  id: string;
  board_id: string;
  title: string;
  details: string | null;
  status_id: string | null;
  user_id: string;
  created_at: string | Date;
  updated_at: string | Date;
}
