export interface Stop {
  stop_lat?: string; // Latitud de una parada
  stop_code?: string; // Código único para una parada
  stop_lon?: string; // Longitud de una parada, entre -180 y 180
  agency_id?: string; // ID para una empresa para la ruta especificada
  stop_id?: string; // ID unico de una parada
  stop_name?: string; // Nombre de una parada
}