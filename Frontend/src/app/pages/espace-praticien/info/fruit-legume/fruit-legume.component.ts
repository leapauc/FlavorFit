import { Component, OnInit } from '@angular/core';
import { GetInfoFromDBService } from '../../../../services/getInfoFromDB';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FruitVegetable {
  name: string;
  weight: number;
  imageUrl?: string;
  source?: string; // facultatif, si tu veux filtrer par catégorie
}

@Component({
  selector: 'app-fruit-legume',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fruit-legume.component.html',
  styleUrls: ['./fruit-legume.component.css'],
})
export class FruitLegumeComponent implements OnInit {
  allItems: FruitVegetable[] = [];
  filterName: string = '';
  filterSource: string = '';
  sources: string[] = []; // liste des catégories si besoin

  constructor(private dbService: GetInfoFromDBService) {}

  ngOnInit(): void {
    this.dbService.getFruitVegetablesWeight().subscribe((res: any[]) => {
      this.allItems = res.map((item) => ({
        name: item.name,
        weight: item.g_weight,
        imageUrl: this.getImageUrl(item.name),
      }));
    });
  }

  getImageUrl(name: string): string {
    if (!name) return 'img/fruit_vegetable/default.svg';

    // normaliser le nom pour correspondre au nom de fichier
    const normalized = name
      .normalize('NFD') // sépare les accents
      .replace(/[\u0300-\u036f]/g, '') // supprime les accents
      .toLowerCase()
      .replace(/ /g, '_')
      .replace('.', '')
      .replace(':', '')
      .replace("'", '_')
      .replace(/-/g, '_');

    return `img/fruit_vegetable/${normalized}.svg`;
  }

  filteredItems(): FruitVegetable[] {
    return this.allItems.filter(
      (i) =>
        (!this.filterName ||
          i.name.toLowerCase().includes(this.filterName.toLowerCase())) &&
        (!this.filterSource || i.source === this.filterSource),
    );
  }
}
