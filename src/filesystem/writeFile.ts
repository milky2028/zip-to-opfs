import { getHandle } from "./getHandle";

type WriteEvent = MessageEvent<{ path: string; file: File; id: string }>;

function writeFromWorker() {
  async function getFileHandle(path: string, { create = false } = {}) {
    const segments = path.split("/").filter(Boolean);
    const fileName = segments.pop();

    if (!fileName || path.endsWith("/")) {
      throw new Error("invalid-path");
    }

    let directory = await navigator.storage.getDirectory();
    for (const segment of segments) {
      directory = await directory.getDirectoryHandle(segment, { create });
    }

    return directory.getFileHandle(fileName, { create });
  }

  self.addEventListener("message", async ({ data: { path, file, id } }: WriteEvent) => {
    try {
      const fileHandle = (await getFileHandle(path, { create: true })) as any;
      const syncHandle = await fileHandle.createSyncAccessHandle();

      const buffer = await file.arrayBuffer();
      syncHandle.truncate(0);
      syncHandle.write(buffer, { at: 0 });

      syncHandle.flush();
      syncHandle.close();

      self.postMessage({ returnVal: "completed", id });
    } catch (e) {
      if (e instanceof Error) {
        self.postMessage({ returnVal: e.message, id });
      }

      self.postMessage({ returnVal: "failed", id });
    }
  });
}

type WriteResponseEvent = MessageEvent<{ returnVal: "completed" | "failed" | string; id: string }>;
let worker: Worker | undefined;

export async function writeFile(path: string, file: File) {
  const fileHandle = await getHandle(path, { create: true, type: "file" });
  if ("createWritable" in fileHandle) {
    const writer = await fileHandle.createWritable();
    return file.stream().pipeTo(writer);
  }

  const id = crypto.randomUUID();
  return new Promise<void>((resolve, reject) => {
    if (!worker) {
      const blob = new Blob([`(${writeFromWorker.toString()})()`], { type: "text/javascript" });
      worker = new Worker(URL.createObjectURL(blob));

      worker.addEventListener("message", ({ data: { returnVal, id: responseId } }: WriteResponseEvent) => {
        if (responseId === id) {
          if (returnVal === "completed") {
            resolve();
          } else {
            reject(new Error(returnVal));
          }
        }
      });
    }

    worker.postMessage({ path, file, id });
  });
}
