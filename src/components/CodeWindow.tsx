import type { ReactNode } from "react";

/** Minimal JSON highlighter for static, trusted strings. */
export function highlightJson(src: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|(\b-?\d+(?:\.\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push(src.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(
        <span key={k++} className={m[2] ? "tok-k" : "tok-s"}>
          {m[1]}
        </span>,
      );
      if (m[2]) out.push(m[2]);
    } else if (m[3] !== undefined) {
      out.push(
        <span key={k++} className="tok-n">
          {m[3]}
        </span>,
      );
    } else if (m[4] !== undefined) {
      out.push(
        <span key={k++} className="tok-n">
          {m[4]}
        </span>,
      );
    }
    last = re.lastIndex;
  }
  if (last < src.length) out.push(src.slice(last));
  return out;
}

export function CodeWindow({
  method = "GET",
  path,
  status = "200 OK",
  children,
  footer,
}: {
  method?: string;
  path: string;
  status?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="code">
      <div className="code__bar">
        <span className="code__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="code__method">{method}</span>
        <span style={{ color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{path}</span>
        <span className="code__status">{status}</span>
      </div>
      <pre>{children}</pre>
      {footer}
    </div>
  );
}
