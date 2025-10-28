import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

@Component({
  selector: 'app-view-home',
  standalone: false,
  templateUrl: './view-home.component.html',
  styleUrl: './view-home.component.css'
})
export class ViewHomeComponent implements OnInit, OnDestroy {
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  private socket!: Socket;
  private pc!: RTCPeerConnection;
  private broadcasterId: string | null = null;

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
  constructor( private responsive: ResponsiveService){}

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$()
    // ✅ Connect to signaling server
    this.socket = io(
      
      // 'http://166.87.229.162:3000', 
      'https://socket-server-1-lb6b.onrender.com',
      
      {
      transports: ['websocket']
    });

    // Create PeerConnection
    this.pc = new RTCPeerConnection();

    // Handle incoming media tracks from broadcaster
    this.pc.ontrack = (event) => {
      console.log('📺 Remote stream received');
      this.remoteVideo.nativeElement.srcObject = event.streams[0];
    };

    // Send our ICE candidates to broadcaster
    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.broadcasterId) {
        this.socket.emit('candidate', this.broadcasterId, event.candidate);
      }
    };

    // Wait until a broadcaster appears before joining
    this.socket.on('broadcaster', () => {
      console.log('🎬 Broadcaster available, joining as viewer');
      this.socket.emit('viewer');
    });

    // Handle incoming offer from broadcaster
    this.socket.on('offer', async (id: string, description: RTCSessionDescriptionInit) => {
      console.log('📡 Offer received from broadcaster:', id);

      this.broadcasterId = id;
      await this.pc.setRemoteDescription(description);

      // Create and send answer
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.socket.emit('answer', id, answer);
    });

    // Handle ICE candidate from broadcaster
    this.socket.on('candidate', async (id: string, candidate: RTCIceCandidateInit) => {
      if (this.pc && candidate) {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  }

  toggleMobileSidebar() {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  ngOnDestroy(): void {
    // Cleanup
    if (this.pc) this.pc.close();
    if (this.socket) this.socket.disconnect();
  }
}
