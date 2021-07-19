const Foo = React.memo(function(props) {
  return <div>{props.bar}</div>;
});

const Bar = React.memo(function(props) {
  return <div>{props.bar}</div>;
});

const Baz = React.memo(function(props) {
  const { bar } = props;
  return <div>{props.bar}</div>;
});

const Fooo = React.memo(function(props) {
  return <div>{props.bar}</div>;
});

const Barr = React.memo(function(props) {
  return <div>{props.bar}</div>;
});

const Bazz = React.memo(function(props) {
  return (
    <div>
      <div>{props.foo}</div>
      <div>{props.bar()}</div>
    </div>
  );
});

const Foooo = React.memo(function(props) {
  const { bar } = props;
  return <div>{bar}</div>;
});

const Barrr = React.memo(function(props) {
  return <div>{props.bar}</div>;
});
