import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

@Component({
  selector: 'app-app-details',
  standalone: false,
  templateUrl: './app-details.component.html',
  styleUrl: './app-details.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AppDetailsComponent {
  appId: any
  appActions: string[] = [
    "Operating Organization",
    "Role",
    "Role Assignment",
    "Frequency",
    "Tag Data Source",
    "Shift"
  ]
  appName: any;
  selectedAction: string;
  constructor(private activateRoute: ActivatedRoute, private router: Router, private responsive :ResponsiveService) {

    // combineLatest([
    //   this.activateRoute.paramMap,
    //   this.activateRoute.queryParams,
    // ]).subscribe(([paramMap, queryParams]) => {
    //   this.appId = paramMap.get('id');
    // });

    const app: any = this.router.getCurrentNavigation()?.extras.state;
    this.appName = app?.appName

    this.appId = this.activateRoute.snapshot.params['id'];
    this.selectedAction = this.appActions[0];
  }
  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;
  ngOnInit(){
    this.isMobile$  = this.responsive.isMobile$();
    // this.isMobile$.subscribe(value => console.log('Is mobile?', value));
  }
}
