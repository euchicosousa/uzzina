import { createRoot } from "react-dom/client";
import { useState } from "react";
import { FileManagerDialog } from "~/components/features/media/FileManagerDialog";
import "~/tailwind.css";

const mode = new URLSearchParams(location.search).get("mode");
const FILE = "https://media.test.invalid/first.jpg";
window.cloudinary = {
  createUploadWidget: () => ({ open() {}, destroy() {} }),
};
function Fixture() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([
    FILE,
    FILE,
    "https://media.test.invalid/last.mp4",
  ]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Gerenciar conteúdo da ação
      </button>
      <output data-testid="files">{JSON.stringify(files)}</output>
      <FileManagerDialog
        open={open}
        onOpenChange={setOpen}
        files={files}
        onChange={setFiles}
        cloudName="test"
        uploadPreset="test"
        directUpload={mode !== "portal"}
        workFiles={mode !== "instagram"}
      />
    </>
  );
}
const root = document.getElementById("root");
if (root) createRoot(root).render(<Fixture />);
