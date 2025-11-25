// import { BadRequestException } from '@nestjs/common';

// export class WrongTaskStatusException extends BadRequestException {
//   constructor(message?: string) {
//     super(message || 'Task status is invalid for this operation');
//   }
// }

export class WrongTaskStatusException extends Error {
  constructor() {
    super('Wrong task status transition!');
    this.name = 'WrongTaskStatusException';
  }
}
