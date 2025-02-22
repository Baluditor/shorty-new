import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import { AuthService } from '../services/auth.service';
import { UserLayoutComponent } from './user-layout.component';

@Component({
  selector: 'app-qr-code',
  imports: [QRCodeComponent, UserLayoutComponent],
  standalone: true,
  template: `
    <app-user-layout>
      <h1 header>QR Code</h1>
      <p description>
        Here is your unique Shorty QR code that will direct people to your
        shortlist when scanned
      </p>
      <ng-container content>
        @if (displayName()) {
          <qrcode
            [qrdata]="
              'https://shorty-minimal.web.app/shortlist/' + displayName()
            "
            [width]="256"
            [imageHeight]="75"
            [imageWidth]="75"
            imageSrc="shorty-qr-code.png"
            errorCorrectionLevel="H"
            [margin]="0" />
        } @else {
          <div class="h-[256px] w-[256px]"></div>
        }
      </ng-container>
      your</app-user-layout
    >
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrCodeComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  displayName: Signal<string | undefined> = this.authService.displayName;

  back() {
    this.router.navigate(['/']);
  }
}
