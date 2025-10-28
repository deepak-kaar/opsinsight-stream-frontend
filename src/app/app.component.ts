import { Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, map, merge, startWith, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit,OnDestroy {

  title = 'opsInsight';
  isOnline:boolean =navigator.onLine;

  private destroy$ = new Subject<void>();
  private db: IDBDatabase | null = null;

  constructor(private router: Router) {
  }

  async ngOnInit() {
    // await this.initIndexedDB();
    
    // Monitor network status
    // this.monitorNetworkStatus();
     

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.db) {
      this.db.close();
    }
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OfflineData', 1);
      
      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains('formData')) {
          const store = db.createObjectStore('formData', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private monitorNetworkStatus(): void {
    // Create observables for online/offline events
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));
    
    // Merge the observables and start with current status
    merge(online$, offline$)
      .pipe(
        startWith(navigator.onLine),
        takeUntil(this.destroy$)
      )
      .subscribe(async (isOnline: boolean) => {
        console.log(`Network status changed: ${isOnline ? 'Online' : 'Offline'}`);
        this.isOnline = isOnline;
        
        if (isOnline) {
          // When coming back online, process pending records
          // await this.processPendingRecords();
        }
      });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    // this.checkScreenSize();
  }

  private checkScreenSize() {
    if (window.innerWidth < 1024) {
      this.router.navigate(['/desktop-required']);
    }
    else{
      if(this.router.url != '/desktop-required'){
        this.router.navigate([this.router.url]);
      }
      else{
        this.router.navigate(['/home']);
      }
    }
  }
  
}
