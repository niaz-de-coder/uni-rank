import React, {useState, useMemo} from 'react'
import SearchForm from './components/SearchForm'
import ResultsList from './components/ResultsList'
import universities from './data/universities.json'

const areas = ["All Areas","Mirpur","Bashundhara","Badda","Dhaka University","Jahangir Nagar","Rajshahi","Chattogram","Uttara","Sylhet","Khulna","Barishal","Rangpur","Comilla"]
const types = ["All","Public","Private","National"]
const programs = ["All","CSE","EEE","Civil","Mechanical","Business Studies","Economics","English","Bangla","Law","Architecture","Pharmacy"]
const budgetRanges = ["Any","2-5 lakh","5-10 lakh","10-20 lakh","20-50 lakh"]

export default function App(){
  const [filters, setFilters] = useState({area: 'All Areas', type: 'All', program: 'All', budget: 'Any'})

  const results = useMemo(()=>{
    return universities.filter(u=>{
      if(filters.area && filters.area !== 'All Areas' && u.area !== filters.area) return false
      if(filters.type && filters.type !== 'All' && u.type !== filters.type) return false
      if(filters.program && filters.program !== 'All' && !(u.programs.map(p=>p.toLowerCase()).includes(filters.program.toLowerCase()))) return false
      // budget applies for Private only
      if(filters.type === 'Private' || (filters.type === 'All' && u.type === 'Private')){
        if(filters.budget && filters.budget !== 'Any'){
          const [minS, maxS] = filters.budget.split('-').map(s=>s.replace(/[^0-9]/g,''))
          const min = Number(minS)
          const max = Number(maxS)
          // u.min_budget_lakh, u.max_budget_lakh
          if(typeof u.min_budget_lakh === 'number'){
            // overlap check
            if(u.max_budget_lakh < min || u.min_budget_lakh > max) return false
          } else {
            return false
          }
        }
      }
      return true
    })
  }, [filters])

  return (
    <div className="app-root">
      <header className="hero">
        <div className="hero-inner">
          <h1>Bangladesh University Select</h1>
          <p className="tag">Find the right university for your program, location and budget — designed for Gen‑Z.</p>
        </div>
      </header>

      <main className="container">
        <SearchForm
          areas={areas}
          types={types}
          programs={programs}
          budgetRanges={budgetRanges}
          filters={filters}
          setFilters={setFilters}
        />

        <ResultsList results={results} />
      </main>

      <footer className="footer">
        <small>Made with ❤️ for Bangladeshi students • Sample data only</small>
      </footer>
    </div>
  )
}
