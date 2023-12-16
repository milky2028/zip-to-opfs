export async function getHandleFromPath(path: string, { create = false } = {}) {
  const segments = path.split("/").filter(Boolean);

  let directory = await navigator.storage.getDirectory();
  for (const segment of segments) {
    directory = await directory.getDirectoryHandle(segment, { create });
  }

  return directory;
}
