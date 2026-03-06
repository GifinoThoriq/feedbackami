export interface IVote {
  id: string;
  post_id: string;
  user_id: string | null;
  guest_identifier: string | null;
  profiles?: { first_name: string; last_name: string; profile_color: string } | null;
}
