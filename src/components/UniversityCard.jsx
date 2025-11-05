import React from 'react'

export default function UniversityCard({uni}){
  return (
    <article className="card">
      <div className="card-top">
        <div className="logo">
          {uni.logo
            ? <img src={uni.logo} alt="logo" />
            : <div className="avatar">{uni.name.split(' ').slice(0,2).map(s=>s[0]).join('')}</div>
          }
        </div>
        <div className="meta">
          <h3>{uni.name}</h3>
          <div className="sub">{uni.area} • {uni.type} • Rank: {uni.ranking}</div>
        </div>
      </div>

      <div className="card-body">
        <div className="programs">Programs: {uni.programs.join(', ')}</div>
        {uni.type === 'Private' && typeof uni.min_budget_lakh === 'number' && (
          <div className="budget">Estimated fee: {uni.min_budget_lakh} - {uni.max_budget_lakh} lakh</div>
        )}
      </div>

      <div className="card-actions">
        <button className="btn primary">View details</button>
        <button className="btn">Save</button>
      </div>
    </article>
  )
}
