import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Lanyard } from '../models/lanyard-profile.model';

const environment = {
  webSocketUrl: 'wss://api.lanyard.rest/socket',
  discordId: '1101222625956597871',
};

@Injectable({
  providedIn: 'root',
})
export class LanyardService {
  private webSocketUrl = environment.webSocketUrl;
  private socket?: WebSocket;

  private dataInitial = {
    op: 2,
    d: {
      subscribe_to_id: environment.discordId,
    },
  };

  private heartbeat_interval = 30000;
  private heartbeat: any;

  private lanyardData = new Subject<Lanyard>();

  constructor() {}

  public setInitialData(profileId: string): void {
    this.dataInitial.d.subscribe_to_id = profileId;
  }

  public setupWebSocket(): void {
    this.socket = new WebSocket(this.webSocketUrl);

    this.socket.onopen = () => {
      this.socket?.send(JSON.stringify(this.dataInitial));

      this.heartbeat = setInterval(() => {
        this.socket?.send(JSON.stringify({ op: 3 }));
      }, this.heartbeat_interval);
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      this.heartbeat_interval = data.d.heartbeat_interval;

      if (data.t === 'INIT_STATE') {
        this.setLanyardData(data);
      }

      if (data.t === 'PRESENCE_UPDATE') {
        this.setLanyardData(data);
      }
    };

    this.socket.onclose = () => {
      clearInterval(this.heartbeat);

      setTimeout(() => {
        this.setupWebSocket();
      }, 5000);
    };
  }

  public setLanyardData(data: Lanyard): void {
    this.lanyardData.next(data);
  }

  public getLanyardData(): Observable<Lanyard> {
    return this.lanyardData.asObservable();
  }
}
