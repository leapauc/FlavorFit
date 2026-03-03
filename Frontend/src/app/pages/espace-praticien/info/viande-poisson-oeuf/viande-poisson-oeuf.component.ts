import { Component, OnInit } from '@angular/core';
import { GetInfoFromDBService } from '../../../../services/getInfoFromDB';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MeatFishEgg {
  name: string;
  source: string;
  img: string;
  weight: number;
  imageUrl?: string; // URL de l'image si dispo
}

@Component({
  selector: 'app-viande-poisson-oeuf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './viande-poisson-oeuf.component.html',
  styleUrls: ['./viande-poisson-oeuf.component.css'],
})
export class ViandePoissonOeufComponent implements OnInit {
  allItems: MeatFishEgg[] = [];
  filterName: string = '';
  filterSource: string = '';
  sources: string[] = [];

  constructor(private dbService: GetInfoFromDBService) {}

  ngOnInit(): void {
    this.dbService.getMeatFishEggWeight().subscribe((res: any[]) => {
      this.allItems = res.map((item) => ({
        name: item.name,
        source: item.animal,
        weight: item.g_weight,
        img: item.img,
        imageUrl: this.getImageUrl(item.img),
      }));
      this.sources = Array.from(new Set(this.allItems.map((i) => i.source)));
    });
  }

  getImageUrl(img: string): string {
    if (!img) return 'img/animals/default.svg';

    const normalized = img
      .normalize('NFD') // sépare les accents
      .replace(/[\u0300-\u036f]/g, '') // supprime les accents
      .toLowerCase()
      .replace(/ /g, '_')
      .replace('-', '_'); // remplace les espaces par _

    return `img/animals/${normalized}.svg`;
  }

  filteredItems(): MeatFishEgg[] {
    return this.allItems.filter(
      (i) =>
        (!this.filterName ||
          i.name.toLowerCase().includes(this.filterName.toLowerCase())) &&
        (!this.filterSource || i.source === this.filterSource),
    );
  }
}
