import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LocalStorageService } from 'ngx-webstorage';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-telegram-game',
  templateUrl: './telegram-game.component.html',
  styleUrls: ['./telegram-game.component.scss']
})
export class TelegramGameComponent implements OnInit {
  gameUrl!: SafeResourceUrl;
  providerId: any;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private _location: Location) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const url = params['url'];
      this.providerId = params['providerId'];
      if (url) {
        this.gameUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(url);
      }
    });
  }

 goToGame(): void {
    this.router.navigate(['/game/play'], {
      replaceUrl: true
    });
}
}


