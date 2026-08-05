import { buildCostSheet } from "@/lib/cost-sheet";
import { formatPrice } from "@/lib/format";
import type { Project } from "@/lib/types";

/**
 * The all-in cost, itemised. Server-rendered so it stays crawlable and so the
 * numbers cannot be quietly recomputed on the client.
 */
export function CostSheet({
  project,
  basePrice,
  carpetArea,
}: {
  project: Project;
  basePrice: number;
  carpetArea: number;
}) {
  const sheet = buildCostSheet({ project, basePrice, carpetArea });

  return (
    <div className="border border-border">
      <div className="border-b border-border p-6">
        <p className="eyebrow text-bronze">What it actually costs</p>
        <p className="measure text-small text-muted-foreground mt-3">
          The agreement value is the number everyone quotes. These are the rest
          of them.
        </p>
      </div>

      <table className="w-full text-left">
        <caption className="sr-only">
          Indicative all-in cost for a {carpetArea.toLocaleString("en-IN")} sq ft
          home at {project.name}
        </caption>
        <tbody>
          {sheet.lines.map((line) => (
            <tr key={line.label} className="border-b border-border align-top">
              <th scope="row" className="p-6 pr-4 font-normal">
                <span className="block">{line.label}</span>
                <span className="text-caption text-muted-foreground mt-1 block">
                  {line.note}
                </span>
              </th>
              <td className="p-6 pl-4 text-right tabular-nums">
                {line.amount === 0 ? "—" : formatPrice(line.amount)}
              </td>
            </tr>
          ))}
          <tr>
            <th scope="row" className="p-6 pr-4 text-lead font-normal">
              Total payable
            </th>
            <td className="p-6 pl-4 text-right text-lead tabular-nums">
              {formatPrice(sheet.total)}
            </td>
          </tr>
        </tbody>
      </table>

      <p className="text-caption text-muted-foreground border-t border-border p-6 leading-relaxed">
        Indicative, and calculated on the starting configuration. Statutory
        rates change by notification and your final figures will come from the
        sale agreement, not from this table.
        {sheet.gstExempt
          ? " No GST applies — this project has received its occupancy certificate."
          : " GST is charged without input tax credit on under-construction homes."}{" "}
        Registration fees in Gujarat are waived where the sole purchaser is a
        woman; ask us to recalculate if that applies to you. Excludes legal
        fees, parking and any bank charges.
      </p>
    </div>
  );
}
