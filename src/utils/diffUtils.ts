import { DiffLine } from '../types';

export function computeLineDiff(original: string, rewritten: string): {
  diffs: DiffLine[];
  additions: number;
  deletions: number;
} {
  const origLines = (original || '').split('\n');
  const rewLines = (rewritten || '').split('\n');

  const diffs: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < origLines.length || j < rewLines.length) {
    if (i < origLines.length && j < rewLines.length && origLines[i] === rewLines[j]) {
      diffs.push({ type: 'same', text: origLines[i] });
      i++;
      j++;
    } else {
      if (i < origLines.length && (j >= rewLines.length || !rewLines.slice(j, j + 4).includes(origLines[i]))) {
        diffs.push({ type: 'removed', text: origLines[i] });
        i++;
      }
      if (j < rewLines.length && (i >= origLines.length || !origLines.slice(i, i + 4).includes(rewLines[j]))) {
        diffs.push({ type: 'added', text: rewLines[j] });
        j++;
      }
    }
  }

  const additions = diffs.filter(d => d.type === 'added').length;
  const deletions = diffs.filter(d => d.type === 'removed').length;

  return { diffs, additions, deletions };
}
