import { Injectable } from '@angular/core';
import axios from "axios";
import { request, response } from 'express';
import { Tag, Accion, Tablero, Luz, Audio, Movimiento } from './models';

@Injectable({
  providedIn: 'root'
})

export class ConectionBackService {
  private baseUrl = 'http://localhost:3000';
  constructor() {}
  async getTablero(): Promise<Tablero[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/tablero`);
      return response.data;
    } catch (error) {
      console.error('Error al encontrar restaurantes', error);
      return [];
    }
  }

  async guardarTablero(data: Tablero): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/tablero/creartablero`, data);
      return response.data;
    } catch (error) {
      console.error('Error al enviar datos al backend:', error);
      throw error;
    }
  }
  async eliminarTablero(id: number): Promise<any> {
    try {
      const response = await axios.delete(`${this.baseUrl}/tablero/eliminar/id/${id}`);
      return response.data;
    }
    catch (error){
      console.error('Error al eliminar restaurante', error);
      throw error;
    }
  }

  async modificarRestaurante(data: Tablero): Promise<any>{
    try {
      const response = await axios.put(`${this.baseUrl}/tablero/update`, data); 
      return response.data;
    }
    catch (error){
      console.error('Error al modificar el restaurante');
      throw error;
    }
  }
}
