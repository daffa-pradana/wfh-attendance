import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  notifyProfileChanged(payload: { employeeId: string; changedField: string }) {
    this.server.emit('profile-changed', payload);
  }
}
