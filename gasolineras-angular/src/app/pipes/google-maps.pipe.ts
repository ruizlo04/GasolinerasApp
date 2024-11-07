import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'googleMaps'
})
export class GoogleMapsPipe implements PipeTransform {

  transform(direccion: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
  }

}
