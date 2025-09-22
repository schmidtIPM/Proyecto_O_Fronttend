import { Injectable } from '@angular/core';
import axios from "axios";
import { Tag, Accion, Tablero, Luz, Audio, Movimiento } from './models';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SrvRecord } from 'node:dns';
import { cp } from 'node:fs';

@Injectable({
  providedIn: 'root'
})
export class ConectionBackService {
  private baseUrl = 'http://192.168.4.1';
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  isFilePath(fondo: string): boolean {
    return /\.(png|jpg|jpeg|gif|webp)$/i.test(fondo);
  }
  async guardarTablero(data: Tablero): Promise<any> {
    const formData = new FormData();
    const renameFile = (file: File, newName: string): File => {
      const ext = file.name.split('.').pop();
      return new File([file], `${newName}.${ext}`, { type: file.type });
    };
    formData.append('data', JSON.stringify(data));
    const appendFondoIfFile = (fondo: string | File | undefined, key: string) => {
      if (fondo instanceof File) {
        const renamed = renameFile(fondo, key);
        formData.append(key, renamed);
      }
    };
    appendFondoIfFile(data.fondo, 'tablero-fondo');
    appendFondoIfFile(data.mainTag.fondo, 'mainTag-fondo');

    data.listaTags.forEach((tag, tagIndex) => {
      appendFondoIfFile(tag.fondo, `tag-${tagIndex}-fondo`);
      tag.listaAcciones.forEach((accion, accionIndex) => {
        if (accion.tipo === 'audio' && typeof (accion as any).archivo !== 'string') {
          const file = (accion as any).archivo as File;
          const renamed = renameFile(file, `tag-${tagIndex}-accion-${accionIndex}`);
          formData.append(`tag-${tagIndex}-accion-${accionIndex}`, renamed);
        }
      });
    });

    data.mainTag.listaAcciones.forEach((accion, i) => {
      if (accion.tipo === 'audio' && typeof (accion as any).archivo !== 'string') {
        const file = (accion as any).archivo as File;
        const renamed = renameFile(file, `mainTag-${i}`);
        formData.append(`mainTag-${i}`, renamed);
      }
    });

    try {
      const response = await axios.post(`${this.baseUrl}/creartablero`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }


  async eliminarTablero(id: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify({ id }));
      console.log({ "id":  id });
      const response = await axios.post(`${this.baseUrl}/eliminar`, { "id":  id });     
      return response.data;
    }
    catch (error) {
      console.error('Error al eliminar tablero', error);
      throw error;
    }
  }
  async modificarTablero(data: Tablero, id: string): Promise<any> {
    try {
      await this.eliminarTablero(id);
      const response = await this.guardarTablero(data);
      return response.data;
    } catch (error) {
      console.error('Error al modificar el tablero:', error);
      throw error;
    }
  }
  async getTableroPorId(id: string): Promise<Tablero | null> {
    try { 
      const response = await axios.get(`${this.baseUrl}/id`, { params: { id: id } });
      const tableros: Tablero[] = [response.data];
      return this.procesarRutas(tableros)[0];
    } catch (error) {
      console.error('Error al obtener el tablero con ID', id, error);
      return null;
    }
  }
  async getTablero(): Promise<Tablero[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/tablero`);
      const tableros = response.data;
      return this.procesarRutas(tableros);
    } catch (error) {
      console.error('Error al obtener tableros', error);
      return [];
    }
  }
  async updateFav(idTablero: string, ponerFavorito: boolean): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/actualizarFav`, { params: { id: idTablero, favorito: ponerFavorito } } );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el tablero', error);
      throw error;
    }
  }
  async getImagenesPagina(): Promise<string[]> {
    return [];
    if (isPlatformBrowser(this.platformId)) {
      try {
        const response = await axios.get(`${this.baseUrl}/static/imgPag`);
        for (let i = 0; i < response.data.length; i++) {
          response.data[i] = this.baseUrl + '/static/imgPag/' + encodeURIComponent(response.data[i]);
        }
        return response.data;
      } catch (error) {
        console.error('Error al obtener imágenes de la página', error);
        return [];
      }
    }
    return [];
  }
  procesarRutas(tableros: Tablero[]): Tablero[] {
    return tableros.map(tablero => {
      if (tablero.fondo && typeof tablero.fondo === 'string' && this.isFilePath(tablero.fondo)) {
        tablero.fondo = this.baseUrl + encodeURI(tablero.fondo);
      }

      const procesarTag = (tag: Tag) => {
        if (tag.fondo && typeof tag.fondo === 'string' && this.isFilePath(tag.fondo)) {
          tag.fondo = this.baseUrl + encodeURI(tag.fondo);
        }

        tag.listaAcciones = tag.listaAcciones.map(accion => {
          if (
            accion.tipo === 'audio' &&
            typeof (accion as Audio).archivo === 'string' &&
            (accion as Audio).archivo !== null
          ) {
            (accion as Audio).archivo = this.baseUrl + encodeURI((accion as Audio).archivo as string);
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

}
