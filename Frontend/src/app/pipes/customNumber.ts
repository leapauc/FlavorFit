import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'customNumber' })
export class CustomNumberPipe implements PipeTransform {
  transform(value: number): string {
    if (value === undefined || value === null) return '0';
    // Arrondir à 1 décimale
    const rounded = Math.round(value * 10) / 10;
    // Si c'est un nombre entier, ne pas afficher la décimale
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
  }
}
