import { addComa } from "@/helpers/formatText"

export default function Dashboard() {

  const STATS = [
    {
      label: 'Cotizaciones del día',
      stat: '12'
    },
    {
      label: 'Cotizaciones de la semana',
      stat: '275'
    },
    {
      label: 'Cotizaciones del mes',
      stat: '1200'
    },
    {
      label: 'Cotizaciones del año',
      stat: '14500'
    }
  ]

  return (
    <>
      <h1 className="text-lg font-semibold">Dashboard</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap:'20px' }}>
        
        {
          STATS.map( stat => {
            return (
              <div key={JSON.stringify(stat)} className="rounded-xl bg-blue-400 p-4" style={{width:'calc(33.3% - 20px)' , height: 'max-content'}} >
                <h3 className="font-semibold text-white">{stat.label}</h3>
                <p className="text-3xl text-blue-800">{addComa(stat.stat)}</p>
              </div>
            )
          })
        }
      </div>
    </>
  )
}
