export interface ITag {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

export interface IPostTag {
  post_id: string;
  tag_id: string;
}
