export class Gasolinera {
  constructor(
    public id: number,
    public nombre: string,
    public price95: number,
    public priceDiesel: number,
    public postalCode: string,
    public direccion: string,
    public comunidad: string,
    public provincia: string
  ) {}
}
