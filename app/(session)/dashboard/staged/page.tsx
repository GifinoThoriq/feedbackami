import { getBoards } from "@/app/actions/boardActions";
import { getStagedPosts } from "@/app/actions/stagedPostActions";
import StagedClient from "./components/StagedClient";
import { IStagedPost } from "@/interface/inbound.interface";

export default async function StagedPage() {
  const boards = await getBoards();

  const stagedByBoard: Record<string, IStagedPost[]> = {};
  await Promise.all(
    boards.map(async (board) => {
      stagedByBoard[board.id] = await getStagedPosts(board.id);
    })
  );

  return <StagedClient boards={boards} initialStagedByBoard={stagedByBoard} />;
}
