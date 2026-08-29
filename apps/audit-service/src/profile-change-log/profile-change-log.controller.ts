import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { ProfileChangeLogService } from './profile-change-log.service';
import { Channel, ConsumeMessage } from 'amqplib';

interface ProfileUpdatedEvent {
  employeeId: string;
  changedField: 'phone' | 'photo' | 'password';
  oldValue: string | null;
  newValue: string | null;
}

@Controller()
export class ProfileChangeLogController {
  constructor(
    private readonly profileChangeLogService: ProfileChangeLogService,
  ) {}

  @EventPattern('profile.updated')
  async handleProfileUpdated(
    @Payload() data: ProfileUpdatedEvent,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as ConsumeMessage;

    try {
      await this.profileChangeLogService.logChange(data);
      channel.ack(originalMsg);
    } catch (err) {
      console.error('Failed to persist profile change log', err);
      channel.nack(originalMsg, false, true); // requeue the message for retry
    }
  }
}
