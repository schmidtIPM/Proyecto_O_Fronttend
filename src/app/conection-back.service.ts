import { Injectable } from '@angular/core';
import axios from "axios";
import { Tag, Accion, Tablero, Luz, Audio, Movimiento } from './models';
import { IAccion, ILuz, IAudio, IMovimiento, ITablero, ITag } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ConectionBackService {
  private baseUrl = 'http://localhost:3000';

  constructor() {}

  async guardarTablero(data: Tablero): Promise<any> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    data.mainTag.listaAcciones.forEach((accion, i) => {
      if (accion.tipo === 'audio' && typeof (accion as any).archivo !== 'string') {
        formData.append(`mainTag-${i}`, (accion as any).archivo as File);
      }
    });
    data.listaTags.forEach((tag, tagIndex) => {
      tag.listaAcciones.forEach((accion, accionIndex) => {
        if (accion.tipo === 'audio' && typeof (accion as any).archivo !== 'string') {
          formData.append(`tag-${tagIndex}-accion-${accionIndex}`, (accion as any).archivo as File);
        }
      });
    });

    try {
      const response = await axios.post(`${this.baseUrl}/tablero/creartablero`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
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
    catch (error) {
      console.error('Error al eliminar tablero', error);
      throw error;
    }
  }

  async modificarRestaurante(data: Tablero): Promise<any> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    data.mainTag.listaAcciones.forEach((accion, i) => {
      if (accion.tipo === 'audio' && typeof (accion as any).archivo !== 'string') {
        formData.append(`mainTag-${i}`, (accion as any).archivo as File);
      }
    });
    data.listaTags.forEach((tag, tagIndex) => {
      tag.listaAcciones.forEach((accion, accionIndex) => {
        if (accion.tipo === 'audio' && typeof (accion as any).archivo !== 'string') {
          formData.append(`tag-${tagIndex}-accion-${accionIndex}`, (accion as any).archivo as File);
        }
      });
    });
    try {
      const response = await axios.put(`${this.baseUrl}/tablero/actualizar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al modificar el tablero:', error);
      throw error;
    }
  }

  async getTableroPorId(id: number): Promise<Tablero | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/tablero/id/${id}`);
      const tableros = response.data;
      await this.convertirAudiosALocalStorage(tableros);
      return this.reemplazarRutasConLocalStorage(tableros)[0];
    } catch (error) {
      console.error('Error al obtener el tablero con ID', id, error);
      return null;
    }
  }

  async getTablero(): Promise<Tablero[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/tablero`);
      const tableros = response.data;
      await this.convertirAudiosALocalStorage(tableros);
      return this.reemplazarRutasConLocalStorage(tableros);
    } catch (error) {
      console.error('Error al obtener tableros', error);
      return [];
    }
  }

  private reemplazarRutasConLocalStorage(tableros: Tablero[]): Tablero[] {
    return tableros.map(tablero => {
      const procesarTag = (tag: Tag) => {
        tag.listaAcciones = tag.listaAcciones.map(accion => {
          if (accion.tipo === 'audio' && typeof (accion as any).archivo === 'string') {
            const nombreArchivo = (accion as any).archivo.split('/').pop();
            const base64 = localStorage.getItem(nombreArchivo || '');
            if (base64) {
              (accion as any).archivo = base64;
            }
          }
          return accion;
        });
        return tag;
      };
      tablero.mainTag = procesarTag(tablero.mainTag);
      tablero.listaTags = tablero.listaTags.map(procesarTag);
      return tablero;
    });
  }

  private async convertirAudiosALocalStorage(tableros: Tablero[]) {
    for (const tablero of tableros) {
      const tags = [tablero.mainTag, ...tablero.listaTags];
      for (const tag of tags) {
        for (const accion of tag.listaAcciones) {
          if (accion.tipo === 'audio' && typeof (accion as any).archivo === 'string') {
            const nombreArchivo = (accion as any).archivo.split('/').pop()!;
            if (!localStorage.getItem(nombreArchivo)) {
              try {
                const blob = await axios.get(this.baseUrl + (accion as any).archivo, { responseType: 'blob' });
                const base64 = await this.convertirBlobABase64(blob.data);
                localStorage.setItem(nombreArchivo, base64);
              } catch (err) {
                console.error(`Error al convertir el audio ${nombreArchivo}`, err);
              }
            }
          }
        }
      }
    }
  }

  private async convertirBlobABase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
