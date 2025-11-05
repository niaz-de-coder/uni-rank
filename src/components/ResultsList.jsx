import React from 'react'
import UniversityCard from './UniversityCard'

export default function ResultsList({results}){
  return (
    <section className="results">
      <div className="results-header">
        <h2>Results</h2>
        <span className="count">{results.length} universities</span>
      </div>

      <div className="cards">
        {results.length === 0 && <div className="empty">No results — try changing filters.</div>}
        {results.map(u=> <UniversityCard key={u.id} uni={u} />)}
      </div>
    </section>
  )
}
