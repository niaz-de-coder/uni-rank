import React from 'react'

export default function SearchForm({areas, types, programs, budgetRanges, filters, setFilters}){
  const onChange = (key)=> (e)=>{
    const value = e.target.value
    setFilters(prev=>({...prev, [key]: value}))
  }

  return (
    <section className="search-card">
      <div className="search-grid">
        <div className="field">
          <label>Area</label>
          <select value={filters.area} onChange={onChange('area')}>
            {areas.map(a=> <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Type</label>
          <select value={filters.type} onChange={onChange('type')}>
            {types.map(t=> <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Program</label>
          <select value={filters.program} onChange={onChange('program')}>
            {programs.map(p=> <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Budget Range (private)</label>
          <select value={filters.budget} onChange={onChange('budget')}>
            {budgetRanges.map(b=> <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      <div className="hint">Tip: choose "Private" under Type to enable budget matching. Try toggling programs and areas.</div>
    </section>
  )
}
