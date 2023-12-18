import { getParentPath } from "./getParentPath";
import { getLastPathElement } from "./getLastPathElement";
import { getHandle } from "./getHandle";
import { wipeFileSystem } from "./wipeFileSystem";

export async function wipePath(path: string) {
  const lastPathElement = getLastPathElement(path);
  if (path === "/" || !path || !lastPathElement) {
    return wipeFileSystem();
  }

  const parentPath = getParentPath(path);
  const parentHandle = await getHandle(parentPath, { type: "directory" });
  return parentHandle.removeEntry(lastPathElement, { recursive: true });
}
