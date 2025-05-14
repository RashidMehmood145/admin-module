import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { User } from '../users/entities/users.model';

@Injectable()
export class TwoFAService {
  async generate2Fa(user: User): Promise<Record<string, any>> {
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(
      user.email,
      process.env.APP_NAME || 'MyApp', // Replace with your app name
      secret,
    );

    const qrCode = await qrcode.toDataURL(otpAuthUrl);

    // Save the secret to the user's record in the database
    user.twoFaSecret = secret;
    await user.save();

    return {
      secret,
      qrCode,
    };
  }

  async verify2Fa(token: string, user: User): Promise<boolean> {
    try {
      return user.twoFaSecret
        ? authenticator.check(token, user.twoFaSecret)
        : false;
    } catch (err) {
      throw new InternalServerErrorException('Verification failed');
    }
  }

  async enable2Fa(user: User): Promise<void> {
    user.isTwoFaEnabled = true;
    await user.save();
  }

  async disable2Fa(user: User): Promise<void> {
    user.isTwoFaEnabled = false;
    user.twoFaSecret = undefined; // Optionally clear the secret
    await user.save();
  }
}
