export interface IComment {
  id: string;
  post_id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  content: string;
  parent_id: string | null;
  created_at: string;
  profiles?: { first_name: string; last_name: string; profile_color: string } | null;
}
