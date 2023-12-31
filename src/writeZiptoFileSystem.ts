import { writeFile } from "./filesystem/writeFile";
import { wipePath } from "./filesystem/wipePath";

export function getFiles(event: DragEvent | (Event & { currentTarget: HTMLInputElement })) {
  const files = event instanceof DragEvent ? event.dataTransfer?.files : event.currentTarget.files;
  return Array.from(files ?? []).filter((file) => file.name.match(/.zip$/));
}

function isSystemFile(directoryName: string) {
  return /__MACOSX|.DS_Store/i.test(directoryName);
}

export async function writeZipToFileSystem(files: File[], path = "/") {
  const archiveWrites = files.map(async (file) => {
    const { Archive } = await import("libarchive.js");
    Archive.init({ workerUrl: "/build/worker-bundle.js" });

    await wipePath(path);
    const zipArchive = await Archive.open(file);

    zipArchive.extractFiles(async (entry) => {
      if (!isSystemFile(entry.path)) {
        await writeFile(`${path ?? ""}/${entry.path}`, entry.file);
      }
    });
  });

  await Promise.all(archiveWrites);
}
