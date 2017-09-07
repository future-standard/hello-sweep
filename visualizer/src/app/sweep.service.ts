import { Injectable, NgZone } from '@angular/core';

import { Observable } from 'rxjs/Observable';


@Injectable()
export class SweepService {
  // msg を流すObservableをつくる
  public msg: Observable<any>;
  private ws: WebSocket;

  constructor(private zone: NgZone) {
    this.ws = new WebSocket('ws://localhost:5000');

    this.msg = Observable.create(observer => {
      this.ws.onmessage = evt => {
        const msg = JSON.parse(evt.data);
        this.zone.run(() => {
          observer.next(msg);
        });
      };

      this.ws.onerror = error => {
        observer.error(error);
      };

      this.ws.onclose = () => {
        observer.complete();
      };
    });
  }

  send(data: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try {
        this.ws.send(data);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

}
