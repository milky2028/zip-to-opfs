export function getParentPath(path: string) {
  const segments = path.split("/").filter(Boolean);
  segments.pop();
  return segments.length === 0 ? "/" : segments.join("/");
}
