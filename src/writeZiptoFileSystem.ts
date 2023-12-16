import { getFileHandle } from "./filesystem/getFileHandle";
import { writeFile } from "./filesystem/writeFile";

export function getFiles(event: DragEvent | (Event & { currentTarget: HTMLInputElement })) {
  const files = event instanceof DragEvent ? event.dataTransfer?.files : event.currentTarget.files;
  return Array.from(files ?? []).filter((file) => file.name.match(/.zip$/));
}

function isSystemFile(directoryName: string) {
  return /__MACOSX|.DS_Store/i.test(directoryName);
}

export async function writeZipToFilesystem(files: File[], path?: string) {
  const archiveWrites = files.map(async (file) => {
    const { Archive } = await import("libarchive.js");
    Archive.init({ workerUrl: "/build/worker-bundle.js" });

    const zipArchive = await Archive.open(file);
    const fileStructure = await zipArchive.getFilesObject();

    zipArchive.extractFiles(async (entry) => {
      if (!isSystemFile(entry.path)) {
        await writeFile(`${path ?? ""}/${entry.path}`, entry.file);
      }
    });
  });

  await Promise.all(archiveWrites);
}
