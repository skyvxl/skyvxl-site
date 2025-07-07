import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LanyardService } from '../../services/Lanyard.service';
import { Activity, Lanyard } from '../../models/lanyard-profile.model';
import { Subscription } from 'rxjs/internal/Subscription';
import { TimestampsService } from '../../services/Timestamps.service';
import { FormsModule } from '@angular/forms';

interface SocialLink {
  name: string;
  icon: string;
  url: string;
  color: string;
  username?: string;
}

@Component({
  selector: 'app-social-links',
  imports: [FormsModule],
  templateUrl: './social-links.component.html',
  styleUrl: './social-links.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialLinksComponent implements OnInit {
  ProfileId = '1101222625956597871';
  lanyardData!: Lanyard | null;
  lanyardActivities: Activity[] = [];
  spotifyActivityIndex: number | null = null;
  statusColor: string = '#43b581';
  percentage = 0;
  subscriptions$: Subscription[] = [];
  apiUrl = 'https://camilo404.azurewebsites.net/v1/'; // sorry for this, I couldn't find another free API

  socialLinks: SocialLink[] = [
    {
      name: 'GitHub',
      icon: 'github',
      url: 'https://github.com/skyvxl',
      color: '#ffffff',
      username: '@skyvxl',
    },
    {
      name: 'Discord',
      icon: 'discord',
      url: 'https://discord.com/users/1101222625956597871',
      color: '#5865f2',
      username: 'qenz1e',
    },
    {
      name: 'Email',
      icon: 'envelope',
      url: 'mailto:xynth@mail.ru',
      color: '#ea4335',
      username: 'xynth@mail.ru',
    },
  ];

  hoveredLink: SocialLink | null = null;
  showContactForm = false;
  sending = false;
  messageSent = false;

  contactForm = {
    name: '',
    email: '',
    message: '',
  };

  constructor(
    private lanyardService: LanyardService,
    private timestampsService: TimestampsService
  ) {}

  async ngOnInit() {
    await this.getLanyardData();
    this.spotifyActivityIndex = this.lanyardActivities.findIndex(
      (activity) => activity.name === 'Spotify'
    );
    console.log(this.lanyardActivities);
  }

  public getLanyardData(): void {
    this.lanyardService.setInitialData(this.ProfileId);
    this.lanyardService.setupWebSocket();

    this.lanyardService.getLanyardData().subscribe({
      next: (data) => {
        this.lanyardData = data;

        this.lanyardActivities = this.lanyardData.d?.activities || [];

        // Unsubscribe from previous subscriptions to avoid memory leaks and multiple subscriptions running at the same time
        if (this.subscriptions$.length > 0) {
          this.subscriptions$.forEach((sub) => sub.unsubscribe());
        }

        // Get the progress percentage and elapsed time for the Spotify activity and other activities
        this.lanyardActivities.forEach((activity) => {
          if (activity.timestamps && activity.name === 'Spotify') {
            this.subscriptions$.push(
              this.timestampsService
                .getProgressPercentage(
                  activity.timestamps.start,
                  activity.timestamps.end
                )
                .subscribe({
                  next: (percentage) => {
                    console.log(percentage);
                    this.percentage = percentage;
                  },
                })
            );

            this.subscriptions$.push(
              this.timestampsService
                .getElapsedTime(activity.timestamps.start)
                .subscribe({
                  next: (timeElapsed) => {
                    activity.timestamps!.start = timeElapsed;
                  },
                })
            );

            activity.timestamps!.end = this.timestampsService.getTotalDuration(
              activity.timestamps.start,
              activity.timestamps.end
            );
          }

          if (activity.timestamps && activity.name !== 'Spotify') {
            this.subscriptions$.push(
              this.timestampsService
                .getElapsedTime(activity.timestamps.start)
                .subscribe({
                  next: (timeElapsed) => {
                    activity.timestamps!.start = timeElapsed;
                  },
                })
            );
          }
        });

        // Get the status color to apply to the platform svg
        switch (this.lanyardData.d?.discord_status) {
          case 'online':
            this.statusColor = '#43b581';
            break;
          case 'idle':
            this.statusColor = '#faa61a';
            break;
          case 'dnd':
            this.statusColor = '#f04747';
            break;
          case 'offline':
            this.statusColor = '#747f8d';
            break;
          case 'streaming':
            this.statusColor = '#593695';
            break;
          case 'invisible':
            this.statusColor = '#747f8d';
            break;
          case 'unknown':
            this.statusColor = '#747f8d';
            break;
          default:
            this.statusColor = '#747f8d';
            break;
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  closeModal(event: Event) {
    if (event.target === event.currentTarget) {
      this.showContactForm = false;
    }
  }

  sendMessage(event: Event) {
    event.preventDefault();

    if (
      !this.contactForm.name ||
      !this.contactForm.email ||
      !this.contactForm.message
    ) {
      return;
    }

    this.sending = true;

    // Simulate sending message
    setTimeout(() => {
      this.sending = false;
      this.messageSent = true;

      // Reset form
      this.contactForm = {
        name: '',
        email: '',
        message: '',
      };

      // Hide success message after 3 seconds
      setTimeout(() => {
        this.messageSent = false;
        this.showContactForm = false;
      }, 3000);
    }, 2000);
  }
}
