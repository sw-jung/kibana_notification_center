import { push } from './push';
import { pull } from './pull';

export function notification(server) {
  push(server);
  pull(server);
};
