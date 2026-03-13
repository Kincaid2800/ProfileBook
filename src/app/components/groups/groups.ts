import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GroupService } from '../../services/group';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './groups.html',
  styleUrl: './groups.css'
})
export class GroupsComponent implements OnInit {
  groups: any[] = [];

  private groupService = inject(GroupService);
  private router = inject(Router);

  async ngOnInit() {
    await this.loadGroups();
  }

  async loadGroups() {
    try {
      this.groups = await this.groupService.getAllGroups();
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  }

  async joinGroup(groupId: number) {
    try {
      await this.groupService.joinGroup(groupId);
      await this.loadGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}