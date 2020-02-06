import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitter'
})
export class SplitterPipe implements PipeTransform {
  transform(value: string, [separator]): string {
    const splits = value.split(separator);
    if (splits.length > 1) {
      length = splits[0].length;
      return value.substr(length + 1, value.length);
    } else {
      return value;
    }
  }
}
