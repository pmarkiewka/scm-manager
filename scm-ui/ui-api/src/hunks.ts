import { useInfiniteQuery } from "react-query";
import { apiClient } from "./apiclient";
import { requiredLink } from "./links";
import { Change, FileDiff, Hunk } from "@scm-manager/ui-types";

const computeMaxExpandHeadRange = (diff: FileDiff, hunks: Hunk[], n: number) => {
  if (diff.type === "delete") {
    return 0;
  } else if (n === 0) {
    return minLineNumber(hunks, n) - 1;
  }
  return minLineNumber(hunks, n) - maxLineNumber(hunks, n - 1) - 1;
};

const computeMaxExpandBottomRange = (diff: FileDiff, hunks: Hunk[], n: number) => {
  if (diff.type === "add" || diff.type === "delete") {
    return 0;
  }
  const changes = hunks[n].changes;
  if (changes[changes.length - 1]?.type === "normal") {
    if (n === hunks.length - 1) {
      return hunks[hunks!.length - 1].fullyExpanded ? 0 : -1;
    }
    return minLineNumber(hunks, n + 1) - maxLineNumber(hunks, n) - 1;
  } else {
    return 0;
  }
};

const minLineNumber = (hunks: Hunk[], n: number): number => {
  return hunks[n].newStart!;
};

const maxLineNumber = (hunks: Hunk[], n: number): number => {
  return hunks[n].newStart! + hunks[n].newLines! - 1;
};

const createNewHunk = (
  oldFirstLineNumber: number,
  newFirstLineNumber: number,
  lines: string[],
  requestedLines: number
) => {
  const newChanges: Change[] = [];

  let oldLineNumber: number = oldFirstLineNumber;
  let newLineNumber: number = newFirstLineNumber;

  lines.forEach((line) => {
    newChanges.push({
      content: line,
      type: "normal",
      oldLineNumber,
      newLineNumber,
      isNormal: true,
    });
    oldLineNumber += 1;
    newLineNumber += 1;
  });

  return {
    changes: newChanges,
    content: "",
    oldStart: oldFirstLineNumber,
    newStart: newFirstLineNumber,
    oldLines: lines.length,
    newLines: lines.length,
    expansion: true,
    fullyExpanded: requestedLines < 0 || lines.length < requestedLines,
  };
};

const getMaxOldLineNumber = (newChanges: Change[]) => {
  const lastChange = newChanges[newChanges.length - 1];
  return lastChange.oldLineNumber || lastChange.lineNumber!;
};

const getMaxNewLineNumber = (newChanges: Change[]) => {
  const lastChange = newChanges[newChanges.length - 1];
  return lastChange.newLineNumber || lastChange.lineNumber!;
};

const insertHunk = (hunks: Hunk[], newHunk: Hunk, position: number) => {
  const newHunks: Hunk[] = [];
  hunks.forEach((oldHunk: Hunk, i: number) => {
    if (i === position) {
      newHunks.push(newHunk);
    }
    newHunks.push(oldHunk);
  });
  if (position === newHunks.length) {
    newHunks.push(newHunk);
  }
  return newHunks;
};

const computeTopRange = (diff: FileDiff, hunks: Hunk[], n: number, count: number) => ({
  start: minLineNumber(hunks, n) - Math.min(count, computeMaxExpandHeadRange(diff, hunks, n)) - 1,
  end: minLineNumber(hunks, n) - 1,
});

const computeBottomRange = (diff: FileDiff, hunks: Hunk[], n: number, count: number) => {
  const maxExpandBottomRange = computeMaxExpandBottomRange(diff, hunks, n);
  const start = maxLineNumber(hunks, n);
  const end =
    count > 0 ? start + Math.min(count, maxExpandBottomRange > 0 ? maxExpandBottomRange : Number.MAX_SAFE_INTEGER) : -1;
  return {
    start,
    end,
  };
};

export type ExpandableHunk = {
  hunk: Hunk;
  maxExpandHeadRange: number;
  maxExpandBottomRange: number;
  expandHead: (count: number) => unknown;
  expandBottom: (count: number) => unknown;
};

export const getHunk = (
  diff: FileDiff,
  hunks: Hunk[],
  n: number,
  expandTop: (n: number, count: number) => unknown,
  expandBottom: (n: number, count: number) => unknown
): ExpandableHunk => {
  return {
    maxExpandHeadRange: computeMaxExpandHeadRange(diff, hunks, n),
    maxExpandBottomRange: computeMaxExpandBottomRange(diff, hunks, n),
    expandHead: (count: number) => expandTop(n, count),
    expandBottom: (count: number) => expandBottom(n, count),
    hunk: hunks[n],
  };
};

type LoadLinesRequest = {
  n: number;
  count: number;
  top: boolean; // else bottom
  hunks?: Hunk[];
};

export const useHunks = (diff: FileDiff) => {
  const { fetchNextPage, data, error } = useInfiniteQuery<Hunk[], Error, LoadLinesRequest>(
    ["hunks", diff.oldRevision, diff.newRevision],
    async ({ pageParam: { n, count, top, hunks } }) => {
      const { start, end } = top ? computeTopRange(diff, hunks, n, count) : computeBottomRange(diff, hunks, n, count);
      const responseText = await apiClient
        .get(requiredLink(diff, "lines").replace("{start}", start.toString()).replace("{end}", end.toString()))
        .then((response) => response.text());
      let lines = responseText.split("\n");
      lines = lines[lines.length - 1] === "" ? lines.slice(0, lines.length - 1) : lines;
      const oldHunk = hunks[n];
      if (top) {
        return insertHunk(
          hunks,
          createNewHunk(oldHunk.oldStart! - lines.length, oldHunk.newStart! - lines.length, lines, lines.length),
          n
        );
      } else {
        return insertHunk(
          hunks,
          createNewHunk(
            getMaxOldLineNumber(oldHunk.changes) + 1,
            getMaxNewLineNumber(oldHunk.changes) + 1,
            lines,
            count
          ),
          n + 1
        );
      }
    },
    {
      initialData: {
        pages: [diff.hunks || []],
        pageParams: [{}],
      },
      enabled: false,
      getNextPageParam: lastPage => ({ hunks: lastPage })
    }
  );

  const outputHunks = data?.pages[data.pages.length - 1].hunks || diff.hunks || [];

  return {
    expandTop: (n: number, count: number): Promise<unknown> => fetchNextPage({ pageParam: { n, count, top: true, hunks: outputHunks } }),
    expandBottom: (n: number, count: number): Promise<unknown> => fetchNextPage({ pageParam: { n, count, top: false, hunks: outputHunks } }),
    hunks: outputHunks,
    error,
  };
};
