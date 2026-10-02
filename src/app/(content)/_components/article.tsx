import type { Block } from "@/content/types";

// Text links on content pages. The brand green alone doesn't have enough
// contrast for small text on the light background, so the link is in the text
// colour and the green goes on the underline.
export const TEXT_LINK_CLASS =
  "inline-flex items-center gap-1 self-start text-sm font-medium text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:decoration-4";

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-4 leading-relaxed text-muted-foreground">
      {blocks.map((block, i) => {
        if (typeof block === "string") return <p key={i}>{block}</p>;
        if ("h" in block) {
          return (
            <h2 key={i} className="mt-4 text-xl font-semibold tracking-tight text-foreground">
              {block.h}
            </h2>
          );
        }
        if ("ul" in block) {
          return (
            <ul key={i} className="flex list-disc flex-col gap-2 pl-5">
              {block.ul.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        if ("ol" in block) {
          return (
            <ol key={i} className="flex list-decimal flex-col gap-2 pl-5">
              {block.ol.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ol>
          );
        }
        if ("table" in block) {
          return (
            <div key={i} className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-foreground">
                  <tr>
                    {block.table.head.map((cell, j) => (
                      <th key={j} className="px-3 py-2 font-semibold">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.table.rows.map((row, j) => (
                    <tr key={j} className="border-t">
                      {row.map((cell, k) => (
                        <td key={k} className="px-3 py-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <p key={i} className="rounded-lg border bg-muted/40 p-4 text-sm">
            {block.note}
          </p>
        );
      })}
    </div>
  );
}

/** Title block + body, for guides and the About / Terms style pages. */
export function ArticlePage({
  title,
  description,
  meta,
  children,
}: {
  title: string;
  description?: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-lg text-muted-foreground">{description}</p>}
        {meta && <p className="text-sm text-muted-foreground">{meta}</p>}
      </header>
      {children}
    </article>
  );
}
