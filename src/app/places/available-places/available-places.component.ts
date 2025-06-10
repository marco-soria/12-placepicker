import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { map } from 'rxjs/operators';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  //constructor(private httpClient: HttpClient) {}
  ngOnInit(): void {
    const subscription = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/places')
      .pipe(map((resData) => resData.places))
      .subscribe({
        next: (places) => {
          this.places.set(places);
        },
      });
    // .subscribe({
    //   next: (resData) => {
    //     //console.log(resData);
    //     this.places.set(resData.places);
    //   },
    // });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
