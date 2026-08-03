export interface TimedItem {
  start: Date;
  end: Date;
}

export interface LaidOutItem<T> {
  item: T;
  lane: number;
  laneCount: number;
}

// Greedy interval-partitioning: assigns each item a "lane" (0-indexed column)
// such that no two items sharing a lane overlap in time, then reports the
// lane count for the cluster of mutually-overlapping items it belongs to
// (so a group of 2 overlapping events gets laneCount=2, not the global max).
export function layoutTimedItems<T extends TimedItem>(
  items: T[]
): LaidOutItem<T>[] {
  const sorted = [...items].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  const results: LaidOutItem<T>[] = [];
  let cluster: { item: T; lane: number }[] = [];
  let clusterEnd = -Infinity;
  let laneEnds: number[] = [];

  const flushCluster = () => {
    if (cluster.length === 0) return;
    const laneCount = Math.max(...cluster.map((c) => c.lane)) + 1;
    for (const c of cluster) {
      results.push({ item: c.item, lane: c.lane, laneCount });
    }
    cluster = [];
    laneEnds = [];
    clusterEnd = -Infinity;
  };

  for (const item of sorted) {
    const start = item.start.getTime();
    const end = item.end.getTime();

    if (start >= clusterEnd) {
      flushCluster();
    }

    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }

    cluster.push({ item, lane });
    clusterEnd = Math.max(clusterEnd, end);
  }
  flushCluster();

  return results;
}
