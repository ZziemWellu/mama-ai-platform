import { assessRisk } from "./api";
import { getPending, removeFromQueue, QueueItem } from "./offlineQueue";

async function submitOne(item: QueueItem): Promise<boolean> {
  try {
    if (item.kind === "assessment") {
      await assessRisk(item.payload);
    }
    return true;
  } catch {
    // Still offline, or the server rejected it — leave it queued either way. A real validation
    // error queued while offline will keep failing until someone looks at it; that's an accepted
    // tradeoff of not being able to validate against the server while offline in the first place.
    return false;
  }
}

/** Replays every queued item for real against the backend. Returns how many were successfully sent. */
export async function flushQueue(): Promise<number> {
  const items = await getPending();
  let sent = 0;
  for (const item of items) {
    if (await submitOne(item)) {
      await removeFromQueue(item.id);
      sent++;
    }
  }
  return sent;
}
