let state = {
  'co2': 2,
  'house.electricity': '3500',
  'house.green_electricity': false,
  'house.gas': '500',
  'car.diesel': '0',
  'car.petrol': '0',
  'train': '0',
  'flights.short_haul': '0',
  'flights.long_haul': '0',
  'diet': 'diet.mixed'
}

const matrix = {
  'diet.meat_lover': 3.3,
  'diet.mixed': 2.5,
  'diet.no_beef': 1.9,
  'diet.vegetarian': 1.7,
  'diet.vegan': 1.5,
  'house.electricity': 0.35555,
  'house.gas': 1.87777,
  'car.diesel': 0.23425,
  'car.petrol': 0.17666,
  'train': 0.03000,
  'flights.short_haul': 0.40000 * 1000 * 2,
  'flights.long_haul': 0.30000 * 6500 * 2
}

const strings = {
  'house.electricity': 'Stroom',
  'house.green_electricity': 'Groene stroom',
  'house.gas': 'Gas',
  'car.diesel': 'Auto (diesel)',
  'car.petrol': 'Auto (benzine)',
  'train': 'Trein (bv. NS)',
  'flights.short_haul': 'Vluchten (kort <1000km)',
  'flights.long_haul': 'Vluchten (lang ~6500km)',
  'diet': 'Diet'
}

let rootRenderer

function getNumber(key) {
  let int = parseInt(state[key], 10)
  return isNaN(int) ? 0 : int
}

function calculate(key) {
  return parseInt(getNumber(key) * matrix[key], 10)
}

function calculateElectricity() {
  const coefficient = state['house.green_electricity'] ? 0 : matrix['house.electricity']
  return parseInt(getNumber('house.electricity') * coefficient, 10)
}

function calculateDiet() {
  return parseInt(matrix[state['diet']] * 1000, 10)
}

function recalculate() {
  state.emissions = []
  state.emissions.push({name: 'house.electricity', amount: calculateElectricity()})
  state.emissions.push({name: 'house.gas', amount: calculate('house.gas')})
  state.emissions.push({name: 'car.diesel', amount: calculate('car.diesel')})
  state.emissions.push({name: 'car.petrol', amount: calculate('car.petrol')})
  state.emissions.push({name: 'train', amount: calculate('train')})
  state.emissions.push({name: 'flights.short_haul', amount: calculate('flights.short_haul')})
  state.emissions.push({name: 'flights.long_haul', amount: calculate('flights.long_haul')})
  state.emissions.push({name: 'diet', amount: calculateDiet()})
  state.emissions.sort(function (a, b) {
    return a.amount < b.amount
  })

  state.co2 = 0
  for(let i=0; i<state.emissions.length; i++) {
    state.co2 += state.emissions[i].amount
  }
}

function update(key, value) {
  state[key] = value
  recalculate()
  reRender()
}

function reRender() {
  if(rootRenderer)
    rootRenderer.setState(state)
}

function changeInput(e, name, type) {
  update(name, type === 'checkbox' ? e.target.checked : e.target.value)
}

const Inputter = (props) => {
  let input = <input id={props.name} onChange={(e) => changeInput(e, props.name, props.type)} value={props.value} />
  if(props.type === 'checkbox') {
    input = <input id={props.name} type='checkbox' onChange={(e) => changeInput(e, props.name, props.type)} defaultChecked={props.value} />
  }
  let label = strings[props.name] || props.name
  console.log(props)
  let unit = props.unit ? <div className='unit'>{props.unit}</div> : null
  return <div>
    <label htmlFor={props.name}>{label}</label>
    <div className='input-container'>
      {input}
      {unit}
    </div>
  </div>
}

const House = (props) => <div>
  <h3>Thuis</h3>
  <Inputter name='house.electricity' value={props['house.electricity']} unit='kWh' />
  <Inputter name='house.gas' value={props['house.gas']} unit='m³' />
  <Inputter name='house.green_electricity' type='checkbox' value={props['house.green_electricity']} />
</div>

const Transport = (props) => <div>
  <h3>Reizen</h3>
  <Inputter name='car.diesel' value={props['car.diesel']} unit='km' />
  <Inputter name='car.petrol' value={props['car.petrol']} unit='km' />
  <h3>Train</h3>
  <Inputter name='train' value={props['train']} unit='km' />
</div>

const Flights = (props) => <div>
  <h3>Vluchten</h3>
  <Inputter name='flights.short_haul' value={props['flights.short_haul']} />
  <Inputter name='flights.long_haul' value={props['flights.long_haul']} />
</div>

function changeDiet(e) {
  update('diet', e.target.value)
}

const Diet = (props) => <div className='diet'>
  <h3>Eten</h3>
  <div>
    <div className='radio-50 left'>
      <label>Vlees liefhebber</label> <input type='radio' name='diet' value='diet.meat_lover' onChange={(e) => changeDiet(e)} />
    </div>
    <div className='radio-50'>
      <label>Gemiddeld eten</label> <input type='radio' name='diet' value='diet.mixed' onChange={(e) => changeDiet(e)} defaultChecked='true' />
    </div>
  </div>
  <div>
    <div className='radio-50 left'>
      <label>Geen rood vlees</label> <input type='radio' name='diet' value='diet.no_beef' onChange={(e) => changeDiet(e)} />
    </div>
    <div className='radio-50'>
      <label>Vegetarian</label> <input type='radio' name='diet' value='diet.vegetarian' onChange={(e) => changeDiet(e)} />
    </div>
  </div>
  <div>
    <div className='radio-50 left'>
      <label>Vegan</label> <input type='radio' name='diet' value='diet.vegan' onChange={(e) => changeDiet(e)} />
    </div>
  </div>
</div>

const References = (props) => <div>
  <h3 className='refs-header'>Referenties</h3>
  <ol className='sources'>
    <li>
      <a href='http://www.aef.org.uk/downloads/Howdoesairtravelcompare.doc'>http://www.aef.org.uk/downloads/Howdoesairtravelcompare.doc</a><br />
      Car: 14,500 km @ 13.6 km per litre = 2,940 kg<br />
      Car - average model - 145-260 grams CO2 per kilometre<br />
      Rail - normal suburban - 130-145 grams CO2 per kilometre<br />
      Flight - short haul (&lt;1000km) - 330-460 grams CO2 per kilometre<br />
      Flight - long haul (~6500km) - 210-330 grams CO2 per kilometre
    </li>
    <li>
      <a href='https://www.milieucentraal.nl/klimaat-en-aarde/klimaatverandering/bereken-je-co2-uitstoot/'>https://www.milieucentraal.nl/klimaat-en-aarde/klimaatverandering/bereken-je-co2-uitstoot/</a><br />
      Car - diesel - 40,000km = 9,370 kg = 0.23425<br />
      Car - petrol - 12,000km = 2,120 kg = 0.17666
    </li>
    <li>
      <a href='http://www.nrc.nl/nieuws/2014/05/15/de-ns-gaat-over-op-100-groene-stroom-a1501748'>http://www.nrc.nl/nieuws/2014/05/15/de-ns-gaat-over-op-100-groene-stroom-a1501748</a><br />
      Train (NS): 30g CO2 / km
    </li>
    <li>
      <a href='http://shrinkthatfootprint.com/food-carbon-footprint-diet'>http://shrinkthatfootprint.com/food-carbon-footprint-diet</a><br />
      Average diet: 2.5t / year<br />
      Meat lover diet: 3.3t / year<br />
      No Beef diet: 1.9t / year<br />
      Vegetarian: 1.7t / year<br />
      Vegan: 1.5t / year<br />
    </li>
  </ol>
</div>

class App extends React.Component {
  constructor() {
    super()
    rootRenderer = this
  }

  render() {
    if(!this.state) return <div>Laden...</div>
    return <div className='app'>
      <h2 className='heading-top'>CO2 uitstoot calculator</h2>
      <div className='left'>
        <House {...this.state} />
        <Transport {...this.state} />
        <Flights {...this.state} />
        <Diet {...this.state} />
      </div>
      <div className='right'>
        <h3>Totale CO2 uitstoot per jaar: {this.state.co2}kg</h3>
        <ol>
        {this.state.emissions.map((em) => {
          let label = strings[em.name] || em.name
          return <li key={em.name}>{label}: {em.amount}kg</li>
        })}
        </ol>
      </div>
      <References />
    </div>
  }
}

ReactDOM.render(
        <App />,
        document.getElementById('app')
      )

recalculate()
reRender()