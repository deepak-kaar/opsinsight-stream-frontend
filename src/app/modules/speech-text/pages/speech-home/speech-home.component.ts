import { Component, NgZone, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

@Component({
  selector: 'app-speech-home',
  standalone: false,
  templateUrl: './speech-home.component.html',
  styleUrl: './speech-home.component.css'
})
export class SpeechHomeComponent implements OnInit {

  /**
         * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
         */
        isMobile$!: Observable<boolean>;
      
        /**
         * @property {boolean} isSidebarOpen - Indicates whether the sidebar menu is currently open or closed.
         */
        isSidebarOpen: boolean = false;
      
        /**
         * @property {boolean} mobileSidebarVisible - Determines whether the sidebar is visible on mobile devices.
          */
        mobileSidebarVisible = false;

        recognizedText: string = '';

        constructor( private responsive: ResponsiveService, private ngZone: NgZone){}

        ngOnInit(): void {
          this.isMobile$ = this.responsive.isMobile$();
          (window as any).onSpeechResult = (text: string) => {
            this.ngZone.run(() => {
              this.recognizedText = text;
            });
          };
        }

        toggleMobileSidebar() {
          this.mobileSidebarVisible = !this.mobileSidebarVisible;
        }

        startSpeech() {
          if ((window as any).flutter_inappwebview) {
            (window as any).flutter_inappwebview.callHandler('StartSpeechRecognition');
          } else {
            alert('Not running in Flutter WebView');
          }
        }
      
        stopSpeech() {
          if ((window as any).flutter_inappwebview) {
            (window as any).flutter_inappwebview.callHandler('StopSpeechRecognition');
          }
        }

        clearTextArea(){
          this.recognizedText ='';
        }



}
