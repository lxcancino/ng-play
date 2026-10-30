import { greet } from './util';

describe('greet', () => {
  it('greets by name', () => {
    expect(greet('Ruben')).toEqual('Hello, Ruben!');
  });
});
