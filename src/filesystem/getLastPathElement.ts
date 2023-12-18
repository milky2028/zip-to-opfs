export function getLastPathElement(path: string) {
  const segments = path.split("/").filter(Boolean);
  return segments.pop();
}
