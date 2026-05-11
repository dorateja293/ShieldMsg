import { Paperclip, X } from "lucide-react";

function FileUploader({ file, onChange, onClear }) {
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
