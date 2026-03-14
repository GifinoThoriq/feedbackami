import { getBoards } from "@/app/actions/boardActions";
import { getAllStagedPosts } from "@/app/actions/stagedPostActions";
import StagedClient from "./components/StagedClient";

export default async function StagedPage() {
  const boards = await getBoards();
  const stagedPosts = await getAllStagedPosts();

  return <StagedClient boards={boards} initialStagedPosts={stagedPosts} />;
}
