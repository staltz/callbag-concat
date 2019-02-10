import { Source, UnwrapSource } from 'callbag';

export default function concat<T extends Source<any>[]>(
  ...sources: T
): Source<UnwrapSource<T[number]>>;
