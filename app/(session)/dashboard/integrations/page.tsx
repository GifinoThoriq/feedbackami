import { getBoards } from "@/app/actions/boardActions";
import IntegrationsClient from "./components/IntegrationsClient";

export default async function IntegrationsPage() {
  const boards = await getBoards();
  return <IntegrationsClient boards={boards} />;
}
