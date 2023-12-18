type GetDirectoryHandle = {
  type: "directory";
  create?: boolean;
};

type GetFileHandle = {
  type: "file";
  create?: boolean;
};

export async function getHandle(path: string, options: GetFileHandle): Promise<FileSystemFileHandle>;
export async function getHandle(path: string, options: GetDirectoryHandle): Promise<FileSystemDirectoryHandle>;
export async function getHandle(
  path: string,
  { type, create }: GetDirectoryHandle | GetFileHandle = { type: "directory", create: false }
): Promise<FileSystemDirectoryHandle | FileSystemFileHandle> {
  const segments = path.split("/").filter(Boolean);
  const lastSegment = segments.pop();

  let directory = await navigator.storage.getDirectory();
  if (!lastSegment || path === "/") {
    return directory;
  }

  for (const segment of segments) {
    // eslint-disable-next-line no-await-in-loop
    directory = await directory.getDirectoryHandle(segment, { create });
  }

  return type === "directory"
    ? directory.getDirectoryHandle(lastSegment, { create })
    : directory.getFileHandle(lastSegment, { create });
}
