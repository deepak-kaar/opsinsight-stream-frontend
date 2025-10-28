import { Component, Input, OnInit } from '@angular/core';
import { LandingPageService } from '../../landing-page.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-ongoing-flag-events',
  standalone: false,
  templateUrl: './ongoing-flag-events.component.html',
  styleUrl: './ongoing-flag-events.component.css'
})
export class OngoingFlagEventsComponent implements OnInit {

  @Input() cardType: any
  /**
   * @property {any} cards  - to store the list ongoing cards
   */
  cards: any

  isShowUi: boolean = false;

  gridStyle: any

  constructor(private landingPageService: LandingPageService, private spinner: NgxSpinnerService) { }


  /**
   * Angular's Life cycle event for intializing components feartures
   * calls the getOnGoing method
   * @returns {void} -  returns nothing
   */
  ngOnInit(): void {
    this.getOnGoingCards()

  }


  /**
   * 
   */
  getOnGoingCards(): void {
    this.spinner.show();
    this.landingPageService.getOnGoingFlags().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (this.cardType === 'Dashboard')
          this.cards = res.filter((item: any) => item.cardType === 'Dashboard');
        else
          this.cards = res.filter((item: any) => item.cardType != 'Dashboard');
        this.isShowUi = true;
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  getLeft(x: number, columns: number = 24): string {
    return `${((x) / columns) * 100}%`;
  }

  getTop(y: number, cellHeight: number = 50): string {
    return `${y * cellHeight}px`;
  }

  getWidthPercentage(w: number, columns: number = 24): string {
    return `${(w / columns) * 100}%`;
  }

  getHeight(h: number, baseHeight: number = 50): string {
    // if (h === undefined) {
    //   return '50px'
    // }
    return `${h * baseHeight}px`;
  }


}
