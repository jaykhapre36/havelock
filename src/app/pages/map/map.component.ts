import { Component, OnInit } from '@angular/core';
import { ParkInfoService } from '../../services/park-info.service';
import { AttractionsService } from '../../services/attractions.service';
import { ParkZone } from '../../models/park-info.model';
import { Attraction } from '../../models/attraction.model';

interface ZoneWithAttractions extends ParkZone {
  attractions: Attraction[];
}

@Component({
  standalone: false,
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  zones: ZoneWithAttractions[] = [];
  selectedZone: ZoneWithAttractions | null = null;
  allAttractions: Attraction[] = [];

  facilities = [
    { icon: '🚻', label: 'Washrooms',     positions: ['top-left', 'bottom-right'] },
    { icon: '🍔', label: 'Food Court',    positions: ['center'] },
    { icon: '🅿️', label: 'Parking',       positions: ['entrance'] },
    { icon: '🏥', label: 'First Aid',     positions: ['center'] },
    { icon: '🔒', label: 'Lockers',       positions: ['entrance'] },
    { icon: '📸', label: 'Photo Booth',   positions: ['center'] },
  ];

  // SVG zone shapes — approximate park layout
  svgZones = [
    { id: 1, path: 'M 60 60 L 260 60 L 260 200 L 60 200 Z',          label: { x: 160, y: 130 } },
    { id: 2, path: 'M 270 60 L 450 60 L 450 200 L 270 200 Z',        label: { x: 360, y: 130 } },
    { id: 3, path: 'M 60 210 L 200 210 L 200 360 L 60 360 Z',        label: { x: 130, y: 285 } },
    { id: 4, path: 'M 210 210 L 450 210 L 450 310 L 210 310 Z',      label: { x: 330, y: 260 } },
    { id: 5, path: 'M 210 320 L 450 320 L 450 380 L 210 380 Z',      label: { x: 330, y: 350 } },
  ];

  // Facility markers on SVG
  svgFacilities = [
    { icon: '🚻', x: 80,  y: 80,  label: 'WC'         },
    { icon: '🍔', x: 240, y: 280, label: 'Food'        },
    { icon: '🅿️', x: 30,  y: 220, label: 'Parking'    },
    { icon: '🏥', x: 390, y: 80,  label: 'First Aid'  },
    { icon: '🔒', x: 390, y: 160, label: 'Lockers'    },
  ];

  constructor(
    private parkInfoService: ParkInfoService,
    private attractionsService: AttractionsService
  ) {}

  ngOnInit(): void {
    this.attractionsService.getAll().subscribe(attractions => {
      this.allAttractions = attractions;
      this.parkInfoService.getParkInfo().subscribe(info => {
        this.zones = info.parkZones.map(zone => ({
          ...zone,
          attractions: attractions.filter(a => a.zone === zone.name)
        }));
      });
    });
  }

  selectZone(zone: ZoneWithAttractions): void {
    this.selectedZone = this.selectedZone?.id === zone.id ? null : zone;
  }

  getZoneById(id: number): ZoneWithAttractions | undefined {
    return this.zones.find(z => z.id === id);
  }

  closePanel(): void {
    this.selectedZone = null;
  }
}
