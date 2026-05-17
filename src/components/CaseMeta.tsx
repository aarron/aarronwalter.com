export interface CaseMetaItem {
  label: string
  value: string
}

interface CaseMetaProps {
  items: CaseMetaItem[]
}

/**
 * CaseMeta — role/outcome/partner metadata row inside a case study.
 * Renders .pf-meta > .pf-meta-item pairs.
 */
export default function CaseMeta({ items }: CaseMetaProps) {
  return (
    <div className="pf-meta">
      {items.map((item) => (
        <div key={item.label} className="pf-meta-item">
          <span className="pf-meta-label">{item.label}</span>
          <span className="pf-meta-value">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
