export interface ITimestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
}
