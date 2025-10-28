import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

@Component({
  selector: 'app-stream-home',
  standalone: false,
  templateUrl: './stream-home.component.html',
  styleUrl: './stream-home.component.css'
})
export class StreamHomeComponent implements OnInit,OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;

  private socket!: Socket;
  private stream!: MediaStream;
  private viewers: Record<string, RTCPeerConnection> = {};
  private isStreaming = false;

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

    // ✅ When a viewer joins, create PeerConnection for them
    this.socket.on('viewer', async (viewerId: string) => {
      if (!this.stream) return; // safety check

      console.log('Viewer joined:', viewerId);
      const pc = new RTCPeerConnection();

      // Send our media to the viewer
      this.stream.getTracks().forEach(track => pc.addTrack(track, this.stream));

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('candidate', viewerId, event.candidate);
        }
      };

      // Create offer and send to viewer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.socket.emit('offer', viewerId, offer);

      // Store connection
      this.viewers[viewerId] = pc;
    });

    // ✅ When a viewer sends an answer
    this.socket.on('answer', async (viewerId: string, description: RTCSessionDescriptionInit) => {
      const pc = this.viewers[viewerId];
      if (pc) {
        await pc.setRemoteDescription(description);
      }
    });

    // ✅ When we receive ICE candidate from a viewer
    this.socket.on('candidate', async (viewerId: string, candidate: RTCIceCandidateInit) => {
      const pc = this.viewers[viewerId];
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  }

  // ✅ Start broadcasting
  async startStream(): Promise<void> {
    if (this.isStreaming) return;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia is not supported in this environment!');
        return;
      }
      console.log('navigator.mediaDevices:', navigator.mediaDevices);
      console.log('navigator.mediaDevices.getUserMedia:', navigator.mediaDevices?.getUserMedia);
      console.log('Requesting camera...');
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log('Camera access granted', this.stream);

      this.localVideo.nativeElement.srcObject = this.stream;
      await this.localVideo.nativeElement.play();

      this.isStreaming = true;

      // Announce broadcaster only after camera is ready
      this.socket.emit('broadcaster');
      console.log('📡 Broadcasting started...');
    } catch (err:any) {
      console.error('Error accessing camera:', err);
      if (err.name) console.error('Error name:', err.name);
    }
  }

  // ✅ Stop broadcasting
  stopStream(): void {
    if (!this.isStreaming) return;

    // Stop local tracks
    this.stream.getTracks().forEach(track => track.stop());

    // Close all PeerConnections
    Object.values(this.viewers).forEach(pc => pc.close());
    this.viewers = {};

    this.isStreaming = false;
    console.log('🛑 Broadcast stopped.');
  }

  toggleMobileSidebar() {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  ngOnDestroy(): void {
    this.stopStream();
    if (this.socket) {
      this.socket.disconnect();
    }
  }

}
