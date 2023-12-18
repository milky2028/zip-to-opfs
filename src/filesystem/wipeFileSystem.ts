export async function wipeFileSystem() {
  const root = await navigator.storage.getDirectory();
  for await (const [item] of root) {
    root.removeEntry(item, { recursive: true });
  }
}
