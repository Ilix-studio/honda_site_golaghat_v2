export interface MotorcycleData {
  id: number;
  name: string;
  image: string;
  specs: {
    engine: string;
    power: string;
    transmission: string;
  };
  price: string;
}
