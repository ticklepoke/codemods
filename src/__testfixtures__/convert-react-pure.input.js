class Foo extends React.Component {
  render() {
    return <div>{this.props.bar}</div>;
  }
}

class Bar extends Component {
  render() {
    return <div>{this.props.bar}</div>;
  }
}

class Baz extends React.Component {
  render = () => {
    const { bar } = this.props;
    return <div>{this.props.bar}</div>;
  };
}

class Fooo extends React.Component {
  render = () => <div>{this.props.bar}</div>;
}

class Barr extends React.Component {
  render = function () {
    return <div>{this.props.bar}</div>;
  };
}

class Bazz extends React.Component {
  render() {
    return (
      <div>
        <div>{this.props.foo}</div>
        <div>{this.props.bar()}</div>
      </div>
    );
  }
}

class Foooo extends React.Component {
  render() {
    const { bar } = this.props;
    return <div>{bar}</div>;
  }
}

class Barrr extends React.Component {
  render() {
    const { props } = this;
    return <div>{props.bar}</div>;
  }
}
