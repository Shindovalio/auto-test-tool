import type { TestDefinition } from "../../types";

interface Props {
  tests: TestDefinition[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TestList({ tests, selectedId, onSelect, onDelete }: Props) {
  if (tests.length === 0) {
    return <div className="empty-state">No tests saved.</div>;
  }

  return (
    <ul className="test-list">
      {tests.map((t) => (
        <li
          key={t.id}
          className={`test-item ${t.id === selectedId ? "selected" : ""}`}
          onClick={() => onSelect(t.id)}
        >
          <span className="test-name">{t.name}</span>
          <button
            className="btn-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(t.id);
            }}
            title="Delete test"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
