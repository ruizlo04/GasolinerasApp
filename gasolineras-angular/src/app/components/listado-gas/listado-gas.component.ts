import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Gasolinera } from '../../modules/gasolinera.interface';
import { GasolineraService } from '../../services/gasolinera.service';
import { GoogleMapsPipe } from '../../pipes/google-maps.pipe';

@Component({
  selector: 'app-listado-gas',
  templateUrl: './listado-gas.component.html',
  styleUrls: ['./listado-gas.component.css'],
})
export class ListadoGasComponent implements OnInit {
  listadoGasolineras: Gasolinera[] = [];
  filteredGasolineras: Gasolinera[] = [];
  fuelType: string = '';
  minPrice: number = 0;
  maxPrice: number = Infinity;
  postalCodeControl = new FormControl();
  filteredPostalCodes: Observable<string[]> | undefined;
  comunidadesAutonomas: any[] = [];
  provincias: any[] = [];
  selectedComunidad: string = '';
  selectedProvincia: string = '';
  comunidadMap: { [key: string]: string } = {};

  constructor(private gasService: GasolineraService) {}

  ngOnInit() {
    this.gasService.getGasolineras().subscribe((respuesta) => {
      console.log('Respuesta completa de la API:', respuesta);
      const respuestaEnString = JSON.stringify(respuesta);
      let parsedData;
      try {
        parsedData = JSON.parse(respuestaEnString);
        let arrayGasolineras = parsedData['ListaEESSPrecio'];

        console.log('Array de gasolineras procesado:', arrayGasolineras);

        this.listadoGasolineras = this.cleanProperties(arrayGasolineras);
        this.filteredGasolineras = this.listadoGasolineras;

        this.filteredPostalCodes = this.postalCodeControl.valueChanges.pipe(
          startWith(''),
          map(value => this._filterPostalCodes(value))
        );

        console.log('Gasolineras después de limpiar propiedades:', this.listadoGasolineras);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });

    this.gasService.getComunidadesAutonomas().subscribe((data) => {
      console.log('Comunidades Autónomas desde la API:', data);
      this.comunidadesAutonomas = data;
      this.comunidadMap = this.comunidadesAutonomas.reduce((acc: any, comunidad: any) => {
        acc[comunidad.IDCCAA] = comunidad.CCAA;
        return acc;
      }, {});

      console.log('Mapa de comunidades (ID a Nombre):', this.comunidadMap);
    });
  }

  onComunidadChange() {
    if (this.selectedComunidad) {
      this.gasService.getProvinciasByComunidad(this.selectedComunidad).subscribe((data: any[]) => {
        console.log('Provincias para la comunidad seleccionada:', data);
        
        if (data && data.length) {
          this.provincias = data.map((provincia) => ({
            IDPovincia: provincia.IDPovincia,
            nombre: provincia.Provincia
          }));
        } else {
          this.provincias = [];
        }
      });
    } else {
      this.provincias = [];
    }
  }

  private cleanProperties(arrayGasolineras: any): Gasolinera[] {
    return arrayGasolineras
      .filter((gasolineraChusquera: any) => {
        return gasolineraChusquera['IDEESS'] && gasolineraChusquera['Rótulo'];
      })
      .map((gasolineraChusquera: any) => {
        console.log('Datos de gasolinera:', gasolineraChusquera);
        const gasolinera = new Gasolinera(
          gasolineraChusquera['IDEESS'],
          gasolineraChusquera['Rótulo'],
          parseFloat(gasolineraChusquera['Precio Gasolina 95 E5'].replace(',', '.')),
          parseFloat(gasolineraChusquera['Precio Gasoleo A'].replace(',', '.')),
          gasolineraChusquera['C.P.'],
          gasolineraChusquera['Dirección'],
          gasolineraChusquera['IDCCAA'],
          ''
        );

        console.log('Gasolinera creada con IDCCAA:', gasolinera);

        return gasolinera;
      });
  }

  private _filterPostalCodes(value: string): string[] {
    const filterValue = value.toLowerCase();
    const postalCodes = this.listadoGasolineras.map(gasolinera => gasolinera.postalCode);
    return [...new Set(postalCodes)].filter(postalCode => postalCode.toLowerCase().includes(filterValue));
  }

  filterGasolineras() {
    this.filteredGasolineras = this.listadoGasolineras.filter(gasolinera => {
      const matchesFuelType = this.fuelType === '' ||
        (this.fuelType === 'Gasolina 95' && gasolinera.price95 > 0) ||
        (this.fuelType === 'Diesel' && gasolinera.priceDiesel > 0);

      const matchesPriceRange = gasolinera.price95 >= this.minPrice && gasolinera.price95 <= this.maxPrice;
      const matchesPostalCode = this.postalCodeControl.value === '' || gasolinera.postalCode === this.postalCodeControl.value;
      const matchesComunidad = this.selectedComunidad === '' || gasolinera.comunidad === this.selectedComunidad;
      const matchesProvincia = this.selectedProvincia === '' || gasolinera.provincia === this.selectedProvincia;

      console.log('Comunidad seleccionada (ID):', this.selectedComunidad);
      console.log('IDCCAA de gasolinera:', gasolinera.comunidad);

      return matchesFuelType && matchesPriceRange && matchesPostalCode && matchesComunidad && matchesProvincia;
    });

    if (this.filteredGasolineras.length === 0) {
      console.log('No hay resultados que coincidan con la búsqueda.');
    }
  }
}
