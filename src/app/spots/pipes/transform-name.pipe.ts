import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformName',
  pure: true,
})
export class TransformNamePipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) {
      return '';
    }
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }
}
