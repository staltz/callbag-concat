import { Source } from 'callbag';

type SourceType<T extends Source<any>> = T extends Source<infer O> ? O : never;

export default function concat<T extends Source<any>[]>(
  ...sources: T
): Source<SourceType<T[number]>>;
