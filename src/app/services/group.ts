import { Injectable, inject } from '@angular/core';
import axios from 'axios';
import { AuthService } from './auth';

export interface GroupSummary {
  groupId: number;
  name: string;
  description: string;
  createdAt: string;
  memberCount: number;
  isMember: boolean;
}

export interface GroupMembershipResponse {
  isMember: boolean;
  memberCount: number;
}

function readNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readBoolean(value: unknown): boolean {
  return value === true || value === 'true';
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = 'https://localhost:7193/api/Group';
  private cacheKey = 'profilebook_groups_cache';
  private authService = inject(AuthService);

  private getAuthHeaders() {
    return {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    };
  }

  private normalizeGroup(raw: any): GroupSummary {
    return {
      groupId: readNumber(raw?.groupId ?? raw?.GroupId),
      name: readString(raw?.name ?? raw?.Name),
      description: readString(raw?.description ?? raw?.Description),
      createdAt: readString(raw?.createdAt ?? raw?.CreatedAt),
      memberCount: readNumber(raw?.memberCount ?? raw?.MemberCount),
      isMember: readBoolean(raw?.isMember ?? raw?.IsMember)
    };
  }

  getCachedGroups(): GroupSummary[] {
    const cachedValue = localStorage.getItem(this.cacheKey);
    if (!cachedValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(cachedValue);
      return Array.isArray(parsed) ? parsed.map(group => this.normalizeGroup(group)) : [];
    } catch {
      return [];
    }
  }

  private writeCachedGroups(groups: GroupSummary[]) {
    localStorage.setItem(this.cacheKey, JSON.stringify(groups));
  }

  async getAllGroups(): Promise<GroupSummary[]> {
    const cachedGroups = this.getCachedGroups();
    const token = this.authService.getToken();

    try {
      const response = await axios.get(this.apiUrl, {
        params: { _: Date.now() },
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const rawGroups = Array.isArray(response.data) ? response.data : [];
      const groups = rawGroups.map(group => this.normalizeGroup(group));

      if (groups.length > 0 || cachedGroups.length === 0) {
        this.writeCachedGroups(groups);
        return groups;
      }

      return cachedGroups;
    } catch (error) {
      if (cachedGroups.length > 0) {
        return cachedGroups;
      }

      throw error;
    }
  }

  async createGroup(name: string, description: string): Promise<GroupSummary> {
    const response = await axios.post(
      this.apiUrl,
      { name, description },
      this.getAuthHeaders()
    );

    const createdGroup = typeof response.data === 'object' && response.data !== null
      ? this.normalizeGroup(response.data)
      : {
          groupId: Date.now(),
          name,
          description,
          createdAt: new Date().toISOString(),
          memberCount: 0,
          isMember: false
        };

    const updatedGroups = [createdGroup, ...this.getCachedGroups().filter(group => group.groupId !== createdGroup.groupId)];
    this.writeCachedGroups(updatedGroups);
    return createdGroup;
  }

  async joinGroup(groupId: number): Promise<GroupMembershipResponse> {
    const response = await axios.post(
      `${this.apiUrl}/${groupId}/join`,
      {},
      this.getAuthHeaders()
    );

    const membership = typeof response.data === 'string'
      ? {
          isMember: response.data.toLowerCase().includes('joined'),
          memberCount: -1
        }
      : {
          isMember: readBoolean(response.data?.isMember ?? response.data?.IsMember),
          memberCount: readNumber(response.data?.memberCount ?? response.data?.MemberCount)
        };

    const updatedGroups = this.getCachedGroups().map(group => {
      if (group.groupId !== groupId) {
        return group;
      }

      return {
        ...group,
        isMember: membership.isMember,
        memberCount: membership.memberCount >= 0 ? membership.memberCount : group.memberCount
      };
    });
    this.writeCachedGroups(updatedGroups);

    return membership;
  }

  async deleteGroup(groupId: number) {
    const response = await axios.delete(
      `${this.apiUrl}/${groupId}`,
      this.getAuthHeaders()
    );

    const updatedGroups = this.getCachedGroups().filter(group => group.groupId !== groupId);
    this.writeCachedGroups(updatedGroups);
    return response.data;
  }
}
