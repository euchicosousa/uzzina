import { createRoot } from "react-dom/client";
import { useState } from "react";
import { ContentReorderDialog } from "~/components/features/media/ContentReorderDialog";
import "~/tailwind.css";

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
      <ContentReorderDialog
        open={open}
        onOpenChange={setOpen}
        files={files}
        onChange={setFiles}
        cloudName="test"
        uploadPreset="test"
      />
    </>
  );
}
const root = document.getElementById("root");
if (root) createRoot(root).render(<Fixture />);
