import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GroupService, GroupSummary } from '../../services/group';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './groups.html',
  styleUrl: './groups.css'
})
export class GroupsComponent implements OnInit, OnDestroy {
  groups: GroupSummary[] = [];
  loading = true;
  private joiningGroupIds = new Set<number>();
  private refreshTimerId: number | null = null;

  private groupService = inject(GroupService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  async ngOnInit() {
    this.groups = this.groupService.getCachedGroups();
    this.loading = this.groups.length === 0;
    await this.loadGroups();

    this.refreshTimerId = window.setInterval(() => {
      void this.loadGroups(false);
    }, 10000);
  }

  ngOnDestroy() {
    if (this.refreshTimerId !== null) {
      window.clearInterval(this.refreshTimerId);
    }
  }

  @HostListener('window:focus')
  async onWindowFocus() {
    await this.loadGroups(false);
  }

  async loadGroups(showLoadingState = true) {
    if (showLoadingState && this.groups.length === 0) {
      this.loading = true;
    }

    try {
      this.groups = await this.groupService.getAllGroups();
    } catch (error) {
      this.toastService.show('Unable to refresh groups. Showing cached list.', 'error');
      this.groups = this.groupService.getCachedGroups();
      console.error('Error loading groups:', error);
    } finally {
      this.loading = false;
    }
  }

  async joinGroup(group: GroupSummary) {
    if (this.joiningGroupIds.has(group.groupId)) {
      return;
    }

    this.joiningGroupIds.add(group.groupId);
    const previousState = {
      isMember: group.isMember,
      memberCount: group.memberCount
    };

    group.isMember = !group.isMember;
    group.memberCount = Math.max(0, previousState.memberCount + (previousState.isMember ? -1 : 1));

    try {
      const membership = await this.groupService.joinGroup(group.groupId);
      group.isMember = membership.isMember;
      if (membership.memberCount >= 0) {
        group.memberCount = membership.memberCount;
      }
    } catch (error) {
      group.isMember = previousState.isMember;
      group.memberCount = previousState.memberCount;
      console.error('Error joining group:', error);
    } finally {
      this.joiningGroupIds.delete(group.groupId);
    }
  }

  isJoining(groupId: number) {
    return this.joiningGroupIds.has(groupId);
  }

  async refreshGroups() {
    await this.loadGroups();
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
