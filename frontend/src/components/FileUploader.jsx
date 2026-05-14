import { Paperclip, X } from "lucide-react";

function FileUploader({ file, onChange, onClear, compact }) {
  if (compact) {
    return (
      <label
        className={`flex cursor-pointer items-center justify-center rounded-full p-2 transition-colors hover:bg-black/5 ${
          file ? "text-[#25d366]" : "text-[#54656f]"
        }`}
        title="Attach"
      >
        <Paperclip size={22} strokeWidth={2} />
        <input
          accept=".pdf,.apk,.zip,.docx,image/*"
          className="hidden"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          type="file"
        />
      </label>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <label className="icon-action cursor-pointer">
        <Paperclip size={18} />
        <input
          accept=".pdf,.apk,.zip,.docx,image/*"
          className="hidden"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          type="file"
        />
      </label>
      {file ? (
        <span className="inline-flex min-w-0 items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm">
          <span className="truncate">{file.name}</span>
          <button onClick={onClear} type="button">
            <X size={15} />
          </button>
        </span>
      ) : null}
    </div>
  );
}

export default FileUploader;
