import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

@Component({
  selector: 'app-module-cards',
  standalone: false,
  templateUrl: './module-cards.component.html',
  styleUrl: './module-cards.component.css'
})

export class ModuleCardsComponent implements OnInit {

  /**
     * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
     */
  isMobile$!: Observable<boolean>;

  constructor(private responsive: ResponsiveService) { }

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
  }

}
