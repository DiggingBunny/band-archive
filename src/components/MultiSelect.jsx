import { useState, useRef, useEffect } from 'react';

export default function MultiSelect({ label, options, selected, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(value) {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function remove(value) {
    onChange(selected.filter(v => v !== value));
  }

  function clearAll() {
    onChange([]);
  }

  function getLabel(value) {
    const opt = options.find(o => o.value === value);
    return opt ? opt.label : value;
  }

  return (
    <div className="multi-select" ref={wrapperRef}>
      {label && <label className="multi-select-label">{label}</label>}
      <div className="multi-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        {selected.length === 0 ? (
          <span className="multi-select-placeholder">{placeholder || '선택하세요'}</span>
        ) : (
          <div className="multi-select-tags">
            {selected.map(value => (
              <span key={value} className="multi-select-tag">
                {getLabel(value)}
                <button
                  type="button"
                  className="multi-select-tag-remove"
                  onClick={(e) => { e.stopPropagation(); remove(value); }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="multi-select-actions">
          {selected.length > 0 && (
            <button
              type="button"
              className="multi-select-clear"
              onClick={(e) => { e.stopPropagation(); clearAll(); }}
            >
              초기화
            </button>
          )}
          <span className="multi-select-arrow">{isOpen ? '▲' : '▼'}</span>
        </div>
      </div>

      {isOpen && (
        <div className="multi-select-dropdown">
          <input
            type="text"
            className="multi-select-search"
            placeholder="검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="multi-select-options">
            {filtered.length === 0 ? (
              <div className="multi-select-empty">결과 없음</div>
            ) : (
              filtered.map(opt => (
                <label key={opt.value} className="multi-select-option">
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.value)}
                    onChange={() => toggle(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
