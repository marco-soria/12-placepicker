import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { catchError, map } from 'rxjs/operators';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal<boolean>(false);
  error = signal<string | null>('');
  // Using inject to get the HttpClient and DestroyRef instances
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  //constructor(private httpClient: HttpClient) {}
  ngOnInit(): void {
    this.isFetching.set(true);
    // Using the HttpClient to fetch places from the backend
    const subscription = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/places')
      .pipe(
        map((resData) => resData.places),
        catchError((error) => {
          console.log(error);
          return throwError(
            () =>
              new Error(
                'Something went wrong fetching the available places. Please try again later.'
              )
          );
        })
      )
      .subscribe({
        next: (places) => {
          this.places.set(places);
        },
        error: (error: Error) => {
          this.error.set(error.message);
        },
        complete: () => {
          this.isFetching.set(false);
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
  onSelectPlace(selectedPlace: Place) {
    this.httpClient
      .put('http://localhost:3000/user-places/', {
        placeId: selectedPlace.id,
      })
      .subscribe({
        next: (resData) => console.log(resData),
      });
  }
}
