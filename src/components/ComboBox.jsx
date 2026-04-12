import { useState, useRef, useEffect } from 'react';

export default function ComboBox({ label, value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

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
    opt.toLowerCase().includes(search.toLowerCase())
  );
  const exactMatch = options.some(opt => opt.toLowerCase() === search.toLowerCase());

  function handleSelect(opt) {
    onChange(opt);
    setSearch('');
    setIsOpen(false);
    setIsCustom(false);
  }

  function handleStartCustom() {
    setIsCustom(true);
    setIsOpen(false);
    onChange('');
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleCustomChange(e) {
    onChange(e.target.value);
  }

  function handleBack() {
    setIsCustom(false);
    onChange('');
    setSearch('');
  }

  // 선택 모드: 기존 옵션에서 선택하거나 새로 입력
  if (isCustom) {
    return (
      <div className="combo-box" ref={wrapperRef}>
        <label>{label} <span className="combo-badge">새로 입력</span></label>
        <div className="combo-custom-row">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleCustomChange}
            placeholder={placeholder}
            className="combo-input"
            required
          />
          <button type="button" className="combo-back-btn" onClick={handleBack}>
            기존 선택
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="combo-box" ref={wrapperRef}>
      <label>{label}</label>
      {value ? (
        <div className="combo-selected">
          <span className="combo-selected-text">{value}</span>
          <button type="button" className="combo-clear" onClick={() => { onChange(''); setSearch(''); }}>
            ×
          </button>
        </div>
      ) : (
        <>
          <div className="combo-trigger" onClick={() => setIsOpen(!isOpen)}>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
              onFocus={() => setIsOpen(true)}
              placeholder={options.length > 0 ? `검색 또는 선택 (${options.length}개)` : '아직 등록된 항목이 없습니다'}
              className="combo-search"
            />
            <span className="combo-arrow">{isOpen ? '▲' : '▼'}</span>
          </div>
          {isOpen && (
            <div className="combo-dropdown">
              {filtered.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className="combo-option"
                  onClick={() => handleSelect(opt)}
                >
                  {opt}
                </button>
              ))}
              {search && !exactMatch && (
                <button
                  type="button"
                  className="combo-option combo-option-new"
                  onClick={() => { setIsCustom(true); onChange(search); setIsOpen(false); }}
                >
                  + "{search}" 새로 추가
                </button>
              )}
              {!search && (
                <button
                  type="button"
                  className="combo-option combo-option-new"
                  onClick={handleStartCustom}
                >
                  + 새로 추가
                </button>
              )}
              {search && filtered.length === 0 && exactMatch && null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
