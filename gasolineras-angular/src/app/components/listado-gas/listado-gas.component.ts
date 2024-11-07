import { Component, OnInit } from '@angular/core';
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
  postalCode: string = '';

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
          gasolineraChusquera['C.P.']
        );
      });
  }

  filterGasolineras() {
    this.filteredGasolineras = this.listadoGasolineras.filter(gasolinera => {
      const matchesFuelType = this.fuelType === '' || (this.fuelType === 'Gasolina 95' && gasolinera.price95 > 0) || (this.fuelType === 'Diesel' && gasolinera.priceDiesel > 0);
      const matchesPriceRange = gasolinera.price95 >= this.minPrice && gasolinera.price95 <= this.maxPrice;
      const matchesPostalCode = this.postalCode === '' || gasolinera.postalCode === this.postalCode;
      return matchesFuelType && matchesPriceRange && matchesPostalCode;
    });

    if (this.filteredGasolineras.length === 0) {
      console.log('No hay resultados que coincidan con la búsqueda.');
    }
  }
}