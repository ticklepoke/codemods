myFn();

console.log();

const { log, error } = console;

log();

error();

const fakeLog = log;

fakeLog();

const a = {
  logProperty: console.log,
  otherProperty: 1,
};

a.logProperty();
