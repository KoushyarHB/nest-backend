import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponse<T> {
  @ApiProperty()
  totalItems: number = 0;

  @ApiProperty()
  page: number = 1;

  @ApiProperty()
  pageSize: number = 10;

  @ApiProperty()
  totalPages: number = 0;

  @ApiProperty({ isArray: true })
  items: T[];
}
