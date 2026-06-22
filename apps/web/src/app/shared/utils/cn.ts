import { mergeClasses } from './merge-classes';
import type { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return mergeClasses(...inputs);
}
