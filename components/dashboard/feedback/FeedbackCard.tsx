import AvatarColor from "@/components/ui/avatar-color";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IPost } from "@/interface/post.interface";
import { ArrowBigUpDash, Tag, UserRound } from "lucide-react";

interface IProps {
  selectedPost: IPost;
  authorId?: string;
}

export default function FeedbackCard({ selectedPost, authorId }: IProps) {
  return (
    <div>
      <section className="rounded-md bg-card mb-6 border">
        <div className="border-b p-4 flex gap-4 items-center">
          <div className="flex flex-col items-center">
            <ArrowBigUpDash className="text-primary" />
            <span className="text-sm font-bold">1</span>
          </div>
          <h5 className="font-medium text-lg">{selectedPost.title}</h5>
        </div>

        <div className="p-4 min-h-[300px]">
          <div className="flex flex-row items-start gap-2">
            <AvatarColor
              profile_color={selectedPost.profiles.profile_color}
              first_name={selectedPost.profiles.first_name[0]}
              last_name={selectedPost.profiles.last_name[0]}
              size="small"
            />
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {selectedPost.profiles.first_name}{" "}
                {selectedPost.profiles.last_name}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {selectedPost.details ??
                  "This post does not have additional details yet. Add a description so everyone has context."}
              </p>
              <div className="flex items-center mt-2 cursor-pointer gap-2">
                {authorId === selectedPost.user_id && (
                  <a className="text-xs text-muted-foreground hover:text-foreground">
                    Edit Post
                  </a>
                )}

                <a className="text-xs text-muted-foreground hover:text-foreground">
                  Reply
                </a>
                {authorId === selectedPost.user_id && (
                  <a className="text-xs text-muted-foreground hover:text-foreground">
                    Delete Post
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-2 border-t">
          <Textarea
            placeholder="Share feedback"
            className="mt-3 border-0 shadow-none"
          />
          <div className="mt-3 flex justify-end">
            <Button size="sm">Send</Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold">Tags</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Organize posts by theme or squads.
          </p>
          <Button variant="outline" size="sm" className="mt-4 w-full">
            <Tag className="size-4" />
            Add tag
          </Button>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold">Voters</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            People who supported this idea.
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-xl border bg-muted/20 px-3 py-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              <UserRound className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium">You</p>
              <p className="text-xs text-muted-foreground">Creator</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
