import React, { useMemo, useRef, useState } from "react";
import "../css/SearchableSelect.css";

/**
 * SearchableSelect (dark theme)
 * - options: [{ label: string, value: string }]
 * - value: selected value (string)
 */
export default function SearchableSelect({
  name,
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Type to search...",
  disabled = false,
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  const selectedLabel = useMemo(() => {
    const opt = options.find((o) => o.value === value);
    return opt?.label ?? "";
  }, [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 200);
    return options
      .filter((o) => o.label.toLowerCase().includes(q))
      .slice(0, 200);
  }, [options, query]);

  const closeSoon = () => {
    // allow click on option before closing
    window.setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      className={`fp-select ${disabled ? "is-disabled" : ""}`}
      ref={containerRef}
      onBlur={closeSoon}
      tabIndex={-1}
    >
      <div
        className={`fp-select-trigger ${open ? "is-open" : ""}`}
        onMouseDown={(e) => {
          e.preventDefault();
          if (disabled) return;
          setOpen((v) => !v);
          setQuery("");
        }}
        role="button"
        aria-disabled={disabled}
        aria-expanded={open}
      >
        <span className={`fp-select-value ${selectedLabel ? "" : "is-placeholder"}`}>
          {selectedLabel || placeholder}
        </span>
        <span className="fp-select-caret">▾</span>
      </div>

      {required && (
        <input
          tabIndex={-1}
          className="fp-select-native-required"
          required
          value={value}
          onChange={() => {}}
          name={name}
          aria-hidden="true"
        />
      )}

      {open && !disabled && (
        <div className="fp-select-popover">
          <input
            className="fp-select-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            autoFocus
          />
          <div className="fp-select-options">
            {filtered.length === 0 ? (
              <div className="fp-select-empty">No results</div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt.value}
                  className={`fp-select-option ${opt.value === value ? "is-selected" : ""}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange?.(opt.value, opt);
                    setOpen(false);
                    setQuery("");
                  }}
                  role="option"
                  aria-selected={opt.value === value}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

