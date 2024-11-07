import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Gasolinera } from '../../modules/gasolinera.interface';
import { GasolineraService } from '../../services/gasolinera.service';

@Component({
  selector: 'app-listado-gas',
  templateUrl: './listado-gas.component.html',
  styleUrls: ['./listado-gas.component.css']
})
export class ListadoGasComponent implements OnInit {

  listadoGasolineras: Gasolinera[] = [];
  filteredGasolineras: Gasolinera[] = [];
  fuelType: string = '';
  minPrice: number = 0;
  maxPrice: number = Infinity;
  postalCodeControl = new FormControl();
  filteredPostalCodes: Observable<string[]> | undefined;

  constructor(private gasService: GasolineraService) {}

  ngOnInit() {
    this.gasService.getGasolineras().subscribe((respuesta) => {
      const respuestaEnString = JSON.stringify(respuesta);
      let parsedData;
      try {
        parsedData = JSON.parse(respuestaEnString);
        let arrayGasolineras = parsedData['ListaEESSPrecio'];
        this.listadoGasolineras = this.cleanProperties(arrayGasolineras);
        this.filteredGasolineras = this.listadoGasolineras;
        this.filteredPostalCodes = this.postalCodeControl.valueChanges.pipe(
          startWith(''),
          map(value => this._filterPostalCodes(value))
        );
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });
  }

  private cleanProperties(arrayGasolineras: any): Gasolinera[] {
    return arrayGasolineras
      .filter((gasolineraChusquera: any) => {
        return gasolineraChusquera['IDEESS'] && gasolineraChusquera['Rótulo'];
      })
      .map((gasolineraChusquera: any) => {
        return new Gasolinera(
          gasolineraChusquera['IDEESS'],
          gasolineraChusquera['Rótulo'],
          parseFloat(gasolineraChusquera['Precio Gasolina 95 E5'].replace(',', '.')),
          parseFloat(gasolineraChusquera['Precio Gasoleo A'].replace(',', '.')),
          gasolineraChusquera['C.P.'],
          gasolineraChusquera['Dirección']
        );
      });
  }

  private _filterPostalCodes(value: string): string[] {
    const filterValue = value.toLowerCase();
    const postalCodes = this.listadoGasolineras.map(gasolinera => gasolinera.postalCode);
    return [...new Set(postalCodes)].filter(postalCode => postalCode.toLowerCase().includes(filterValue));
  }

  filterGasolineras() {
    this.filteredGasolineras = this.listadoGasolineras.filter(gasolinera => {
      const matchesFuelType = this.fuelType === '' || (this.fuelType === 'Gasolina 95' && gasolinera.price95 > 0) || (this.fuelType === 'Diesel' && gasolinera.priceDiesel > 0);
      const matchesPriceRange = gasolinera.price95 >= this.minPrice && gasolinera.price95 <= this.maxPrice;
      const matchesPostalCode = this.postalCodeControl.value === '' || gasolinera.postalCode === this.postalCodeControl.value;
      return matchesFuelType && matchesPriceRange && matchesPostalCode;
    });

    if (this.filteredGasolineras.length === 0) {
      console.log('No hay resultados que coincidan con la búsqueda.');
    }
  }
}