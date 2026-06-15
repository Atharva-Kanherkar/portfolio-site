import type { Frontmatter, Section } from '@studio/types';
import { WRITING_SECTIONS } from '../../consts';

interface Props {
  value: Frontmatter;
  onChange: (next: Frontmatter) => void;
}

export function FrontmatterForm({ value, onChange }: Props) {
  return (
    <div className="fm">
      <input
        className="fm__title"
        placeholder="Title"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
      />
      <textarea
        className="fm__desc"
        placeholder="One-line description (used for previews + SEO)"
        rows={2}
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
      />
      <div className="fm__row">
        <label className="fm__field">
          <span className="fm__label">Category</span>
          <select
            className="fm__select"
            value={value.section}
            onChange={(e) => onChange({ ...value, section: e.target.value as Section })}
          >
            {WRITING_SECTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="fm__field fm__field--grow">
          <span className="fm__label">Tags</span>
          <input
            className="fm__tags"
            placeholder="comma, separated"
            value={value.tags.join(', ')}
            onChange={(e) =>
              onChange({
                ...value,
                tags: e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
      </div>
    </div>
  );
}
