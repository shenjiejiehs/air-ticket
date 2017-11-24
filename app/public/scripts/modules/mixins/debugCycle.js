module.exports = {
  componentWillMount: debug('componentWillMount'),
  componentDidMount: debug('componentDidMount'),
  componentWillUpdate: debug('componentWillUpdate'),
  componentDidUpdate: debug('componentDidUpdate'),
  componentWillUnmount: debug('componentWillUnmount'),
  componentWillDetached: debug('componentWillDetached')
};


function debug(name){
  return function(){
    console.log(this.name || this.id, name);
  };
}
