import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GroupService } from '../../services/group';


 //GroupsComponent — User-facing groups page
 // Displays all groups created by admin.
 //Users can join or leave any group (toggle handled by backend).
 //Route: /groups
 
@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './groups.html',
  styleUrl: './groups.css'
})
export class GroupsComponent implements OnInit {
  // Holds the list of groups returned from GET /api/Group
  // Each group has: groupId, name, description, memberCount
  groups: any[] = [];

  // Angular inject() pattern used instead of constructor injection
  private groupService = inject(GroupService);
  private router = inject(Router);

  
   //Lifecycle hook — runs once when component initializes
   //Immediately fetches all available groups from the API
   
  async ngOnInit() {
    await this.loadGroups();
  }

  
   // Fetches all groups from GET /api/Group
   //Requires JWT token — GroupService.getHeaders() adds Authorization header
   // Updates the groups array which drives the *ngFor in the template
   
  async loadGroups() {
    try {
      this.groups = await this.groupService.getAllGroups();
    } catch (error) {
      // Logs error but doesn't crash — empty groups array stays as fallback
      console.error('Error loading groups:', error);
    }
  }

  
   //Toggles group membership for the logged-in user
   //Calls POST /api/Group/{id}/join
   // Backend logic: adds GroupMember record if not member, removes it if already member
   //Reloads groups after toggle so memberCount updates immediately
   // @param groupId - The GroupId of the group to join or leave
   
  async joinGroup(groupId: number) {
    try {
      await this.groupService.joinGroup(groupId);
      // Reload to reflect updated memberCount after join/leave
      await this.loadGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  }

  
   //Navigates back to the home feed
   //Uses Angular Router instead of browser back to maintain app state
   
  goHome() {
    this.router.navigate(['/home']);
  }
}