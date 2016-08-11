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

let state = {
  blocks: blocks1,
  modal: {active: false, value: ''}
}

let rootRenderer

function reRender() {
  if(rootRenderer)
    rootRenderer.setState(state)
}

class InputModal extends React.Component {
  deactivate(e) {
    state.modal.active = false
    reRender()
  }
  
  render() {
    let display = this.props.settings.active ? 'block' : 'none'
    let style = {display: display}
    return <div style={style} className='modal'>
      <div class='modal-header'>
        <button onClick={(e) => this.deactivate(e)}>✕</button>
      </div>
      {this.props.settings.value}
    </div>
  }
}

class Inputter extends React.Component {
  changeInput(e) {
    state.blocks[this.props.name].input = e.target.value
    reRender()
  }

  showModal(e) {
    state.modal = {active: true, value: this.props.value}
    reRender()
  }

  render() {
    // TODO: if input value is too large/complex:
    // * show an abbreviated readonly representation
    // * let user click this to open a modal window to see all data and edit it
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
  }

  reCompile(e) {
    state.blocks[this.props.name].source = e.target.value
    this.compile()
    reRender()
  }

  compile() {
    let myBlock = this.props.blocks[this.props.name]
    let mappedSource = myBlock.source.replace(/\$([a-z]+)/g, "state.blocks.$1.program")
    let name = this.props.name
    state.blocks[this.props.name].program = function() {
      //console.log('arguments inside run: ', arguments)
      var args = Array.prototype.slice.call(arguments)
      state.blocks[name].input = JSON.stringify(args)
      let output = eval('(' + mappedSource + ')').apply(null, arguments)
      state.blocks[name].output = JSON.stringify(output)
      reRender()
      return output
    }
  }

  run(e) {
    let myBlock = this.props.blocks[this.props.name]
    let args = eval(myBlock.input)
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
      );

reRender()