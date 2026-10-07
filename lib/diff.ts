// lib/diff.ts — tiny line-based diff (LCS) plus a change-ratio metric.
// Written by hand so we don't pull in a diff dependency.

export interface DiffOp {
  type: "same" | "add" | "del";
  text: string;
}

/**
 * Line diff between two texts. Common prefix/suffix are trimmed first so the
 * O(n*m) LCS only runs on the actually-changed middle; a coarse fallback
 * handles pathological sizes.
 */
export function diffLines(a: string, b: string): DiffOp[] {
  const A = a.split("\n");
  const B = b.split("\n");

  let start = 0;
  while (start < A.length && start < B.length && A[start] === B[start]) start++;

  let endA = A.length - 1;
  let endB = B.length - 1;
  while (endA >= start && endB >= start && A[endA] === B[endB]) {
    endA--;
    endB--;
  }

  const ops: DiffOp[] = [];
  for (let i = 0; i < start; i++) ops.push({ type: "same", text: A[i] });

  const midA = A.slice(start, endA + 1);
  const midB = B.slice(start, endB + 1);
  if (midA.length * midB.length > 9_000_000) {
    // Too big for the DP table: mark the whole middle as replaced.
    for (const t of midA) ops.push({ type: "del", text: t });
    for (const t of midB) ops.push({ type: "add", text: t });
  } else {
    ops.push(...lcsDiff(midA, midB));
  }

  for (let i = endA + 1; i < A.length; i++) ops.push({ type: "same", text: A[i] });
  return ops;
}

function lcsDiff(a: string[], b: string[]): DiffOp[] {
  const n = a.length;
  const m = b.length;
  const stride = m + 1;
  const dp = new Uint32Array((n + 1) * stride);

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * stride + j] =
        a[i] === b[j]
          ? dp[(i + 1) * stride + (j + 1)] + 1
          : Math.max(dp[(i + 1) * stride + j], dp[i * stride + (j + 1)]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (dp[(i + 1) * stride + j] >= dp[i * stride + (j + 1)]) {
      ops.push({ type: "del", text: a[i] });
      i++;
    } else {
      ops.push({ type: "add", text: b[j] });
      j++;
    }
  }
  while (i < n) ops.push({ type: "del", text: a[i++] });
  while (j < m) ops.push({ type: "add", text: b[j++] });
  return ops;
}

/** Fraction of lines that changed (0 = identical, 1 = fully replaced). */
export function changeRatio(a: string, b: string): number {
  const maxLines = Math.max(a.split("\n").length, b.split("\n").length);
  if (maxLines === 0) return 0;
  let changed = 0;
  for (const op of diffLines(a, b)) {
    if (op.type !== "same") changed++;
  }
  return changed / maxLines;
}
