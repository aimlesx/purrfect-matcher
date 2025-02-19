import { OccurenceType } from './matcher';

export class Aggregator {
  constructor(private partials: OccurenceType[][] = []) {}

  addResult(result: OccurenceType[]) {
    this.partials.push(result);
  }

  getResults(): OccurenceType[] {
    return this.partials.flat();
  }
}
