export interface IInboundSource {
  id: string;
  board_id: string;
  user_id: string;
  source_type: "slack" | "discord" | "custom";
  label: string | null;
  secret_token: string;
  created_at: string;
}

export interface IStagedPost {
  id: string;
  board_id: string;
  title: string;
  details: string | null;
  raw_feedback_ids: string[];
  created_at: string;
}
