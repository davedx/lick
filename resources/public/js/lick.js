let blocks1 = {
  greet: {
    source: 'function greet(name, greeting) {\n  return greeting+" "+$formalize(name, "Clayton")\n}',
    program: null,
    output: '',
    input: '["Davey Higglepiggle Willums","Hi!"]'
  },
  formalize: {
    source: 'function formalize(first, last) {\n  return "Mr. "+first+" "+last\n}',
    program: null,
    output: '',
    input: '["Mike","Smith"]'
  }
}

let blocks2 = {
  mapper: {
    source: 'function mapper(items) {\n  return items.map((item) => { return item+1 })\n}',
    output: '',
    input: '[[1, 2, 3, 4, 5]]',
  },
  printer: {
    source: 'function printer(items) {\n  console.log(items) return true\n}',
    output: '',
    input: '[[1, 2]]'
  }
}

let state = {
  blocks: blocks1,
  modal: {active: false, name: '', value: ''},
  controls: {
    create: {active: false}
  }
}

let rootRenderer

function updateBlock(blockName, key, value, render = true) {
  state.blocks[blockName][key] = value
  if(render)
    reRender()
}

function updateModal(props) {
  state.modal = props
  //console.log('modal state: ', state.modal)
  reRender()
}

function reRender() {
  if(rootRenderer)
    rootRenderer.setState(state)
}

class InputModal extends React.Component {
  deactivate(e) {
    state.modal.active = false
    reRender()
  }

  onChange(e) {
    state.modal.value = e.target.value
    updateBlock(this.props.settings.name, 'input', e.target.value)
  }

  render() {
    let display = this.props.settings.active ? 'block' : 'none'
    let style = {display: display}
    return <div style={style} className='modal'>
      <div className='modal-header'>
        Input
        <button onClick={(e) => this.deactivate(e)}>✕</button>
      </div>
      <textarea className='modal-input'
        onChange={(e) => this.onChange(e)} value={this.props.settings.value} />
    </div>
  }
}

class Inputter extends React.Component {
  changeInput(e) {
    updateBlock(this.props.name, 'input', e.target.value)
  }

  showModal(e) {
    updateModal({active: true, name: this.props.name, value: this.props.value})
  }

  render() {
    let abbrev
    if (this.props.value.length > 15) {
      abbrev = this.props.value.substr(0, 13) + '...'
    }
    if (abbrev) {
      return <input onClick={(e) => this.showModal(e)} value={abbrev} readOnly />
    }
    return <input onChange={(e) => this.changeInput(e)} value={this.props.value} />
  }
}

class Block extends React.Component {
  constructor() {
    super()
    this.state = {error: ''}
  }

  componentDidMount () {
    this.compile()
  }

  reCompile(e) {
    updateBlock(this.props.name, 'source', e.target.value)
    this.compile()
  }

  toggleCreateBlock (active, name) {
    this.setState({createBlock: active, createName: name})
  }

  createBlock(e) {
    const name = this.state.createName
    state.blocks[name] = {
      source: 'function '+name+' () {\n\n}',
      output: '',
      input: '[]'
    }
    // recompile to re-bind to the new block
    this.compile()
    reRender()
  }

  functioner (match, p1) {
    //console.log('functioner: ', funcName, f)
    if (state.blocks[p1]) {
      state.prevMatch = p1
      this.toggleCreateBlock(false, p1)
      return "state.blocks." + p1 + ".program"
    } else {
      // show create block
      this.toggleCreateBlock(true, p1)
    }
  }

  compile() {
    let name = this.props.name
    let myBlock = this.props.blocks[name]
    //TODO: replace regex replacement with a function. the function should check if $1.program
    //exists. If not, it should create a new block with the function name.
    let mappedSource = myBlock.source.replace(/\$([a-z]+)/g, this.functioner.bind(this))
    let setState = this.setState.bind(this) // yuck

    updateBlock(name, 'program', function() {

      var args = Array.prototype.slice.call(arguments)
      updateBlock(name, 'input', JSON.stringify(args))

      let program = eval('(' + mappedSource + ')')

      let output = ''
      try {
        output = program.apply(null, arguments)
        setState({error: ''})
      } catch (e) {
        //output = e.message
        setState({error: e.message})
        //throw e
        //should I stay or should I throw
        //so come on and let me know now
      }

      updateBlock(name, 'output', JSON.stringify(output))

      return output
    }, false)
  }

  run(e) {
    let myBlock = this.props.blocks[this.props.name]
    let args = eval(myBlock.input)
    //console.log('args evald from "'+myBlock.input+'": ', args)
    console.log(myBlock.program.apply(null, args))
  }

  render() {
    let myBlock = this.props.blocks[this.props.name]
    let style = {
      left: this.props.left+'px',
      top: this.props.top+'px',
      backgroundColor: this.state.error === '' ? '#bdf': 'red'
    }
    let createStyle = {display: this.state.createBlock ? 'inline-block' : 'none'}
    //console.log('style: ', style)
    return <div className='block' style={style}>
              <div className='block-io'>
                <div className='block-io-input'>
                  <Inputter name={this.props.name} value={myBlock.input} />
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
                <span className='error'>{this.state.error}</span>
                <button style={createStyle} onClick={(e) => this.createBlock(e)}>Create '{this.state.createName}'</button>
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
    for (let k in this.state.blocks) {
      blocks.push(<Block key={k} name={k} blocks={this.state.blocks} left={x} top={y} />)
      x += 520
    }
    return <div>{blocks}<InputModal settings={this.state.modal} /></div>
  }
}

ReactDOM.render(
        <Blocks />,
        document.getElementById('app')
      )

reRender()