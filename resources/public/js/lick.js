let state = {
  greet: {
    source: 'function greet(name, greeting) {\n  return greeting+" "+$formalize(name, "Clayton")\n}',
    program: null,
    output: '',
    input: '["Dave","Hi!"]'
  },
  formalize: {
    source: 'function formalize(first, last) {\n  return "Mr. "+first+" "+last\n}',
    program: null,
    output: '',
    input: '["Mike","Smith"]'
  }
}

let state2 = {
  mapper: {
    source: 'function mapper(items) {\n  return items.map((item) => { return item+1 });\n}',
    output: '',
    input: '[[1, 2, 3, 4, 5]]',
  },
  printer: {
    source: 'function printer(items) {\n  console.log(items); return true;\n}',
    output: '',
    input: '[[1, 2]]'
  }
}
state = state2

let rootRenderer

function reRender() {
  if(rootRenderer)
    rootRenderer.setState(state)
}

class Block extends React.Component {
  constructor() {
    super()
  }

  reCompile(e) {
    state[this.props.name].source = e.target.value
    this.compile()
    reRender()
  }

  compile() {
    let myBlock = this.props.blocks[this.props.name]
    let mappedSource = myBlock.source.replace(/\$([a-z]+)/g, "state.$1.program")
    let name = this.props.name
    state[this.props.name].program = function() {
      //console.log('arguments inside run: ', arguments)
      var args = Array.prototype.slice.call(arguments)
      state[name].input = JSON.stringify(args)
      let output = eval('(' + mappedSource + ')').apply(null, arguments)
      state[name].output = JSON.stringify(output)
      reRender()
      return output
    }
  }

  changeInput(e) {
    state[this.props.name].input = e.target.value
    reRender()
  }

  run(e) {
    let myBlock = this.props.blocks[this.props.name]
    let args = eval(myBlock.input)//.split(',')
    //console.log('args evald from "'+myBlock.input+'": ', args)
    console.log(myBlock.program.apply(null, args))
  }

  render() {
    let myBlock = this.props.blocks[this.props.name]
    this.compile()
    let style = {left: this.props.left+'px', top: this.props.top+'px'}
    //console.log('style: ', style)
    return <div className='block' style={style}>
              <div className='block-io'>
                <div className='block-io-input'>
                  <input onChange={(e) => this.changeInput(e)} value={myBlock.input} />
                  <div className='io-arrow'>→</div>
                </div>
                <div className='block-io-input'>
                  <input value={myBlock.output} readOnly />
                  <div className='io-arrow'>←</div>
                </div>
              </div>
              <textarea className='block-src'
                rows='8' cols='50'
                onChange={(e) => this.reCompile(e)} value={myBlock.source}></textarea>
              <div className='block-btns'>
                <button onClick={(e) => this.run(e)}>Run</button>
              </div>
            </div>
  }
}

class Blocks extends React.Component {
  constructor() {
    super()
    rootRenderer = this
  }

  render() {
    if(!this.state) return <div>Loading</div>

    let blocks=[], x=0, y=0
    for (let k in this.state) {
      blocks.push(<Block key={k} name={k} blocks={this.state} left={x} top={y} />)
      x += 520
    }
    return <div>{blocks}</div>
  }
}

ReactDOM.render(
        <Blocks />,
        document.getElementById('app')
      );

reRender()