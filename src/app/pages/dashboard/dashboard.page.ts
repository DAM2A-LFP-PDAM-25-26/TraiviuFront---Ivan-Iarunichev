import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonBadge,
  AlertController,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import {
  AdminApiService,
  AdminUser,
  AdminClan,
  AdminClanMember,
} from '../../services/admin';
import { addIcons } from 'ionicons';
import {
  trashOutline,
  pencilOutline,
  addOutline,
  logOutOutline,
  chevronDownOutline,
  chevronUpOutline,
  lockClosedOutline,
  lockOpenOutline,
} from 'ionicons/icons';

type ActiveTab = 'users' | 'clans';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonBadge,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    DatePipe,
  ],
})
export class DashboardPage implements OnInit {
  activeTab: ActiveTab = 'users';

  users: AdminUser[] = [];
  clans: AdminClan[] = [];
  expandedClanMembers: Record<string, AdminClanMember[]> = {};
  expandedClanIds = new Set<string>();

  totalUsers = 0;
  totalAdmins = 0;
  totalBlocked = 0;
  totalClans = 0;

  isLoadingUsers = false;
  isLoadingClans = false;
  isLoadingMembers: Record<string, boolean> = {};

  constructor(
    private adminApi: AdminApiService,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      trashOutline,
      pencilOutline,
      addOutline,
      logOutOutline,
      chevronDownOutline,
      chevronUpOutline,
      lockClosedOutline,
      lockOpenOutline,
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadClans();
  }

  setTab(event: CustomEvent) {
    this.activeTab = event.detail.value as ActiveTab;
  }

  private updateUserStats(): void {
    this.totalUsers = this.users.length;
    this.totalAdmins = this.users.filter((user) => user.role === 'ADMIN').length;
    this.totalBlocked = this.users.filter((user) => user.blocked).length;
  }

  private updateClanStats(): void {
    this.totalClans = this.clans.length;
  }

  loadUsers() {
    this.isLoadingUsers = true;
    this.adminApi.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.updateUserStats();
        this.isLoadingUsers = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.isLoadingUsers = false;
      },
    });
  }

  loadClans() {
    this.isLoadingClans = true;
    this.adminApi.getClans().subscribe({
      next: (data) => {
        this.clans = data;
        this.updateClanStats();
        this.isLoadingClans = false;
      },
      error: (err) => {
        console.error('Error al cargar clanes:', err);
        this.isLoadingClans = false;
      },
    });
  }

  async presentCreateUserAlert() {
    const alert = await this.alertController.create({
      header: 'Nuevo usuario',
      inputs: [
        { name: 'email', type: 'email', placeholder: 'Email' },
        { name: 'displayName', type: 'text', placeholder: 'Nombre visible' },
        {
          name: 'role',
          type: 'text',
          placeholder: 'Rol (USER / ADMIN)',
          value: 'USER',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: (data) => {
            if (!data.email?.trim() || !data.displayName?.trim()) {
              return false;
            }

            this.adminApi
              .createUser({
                email: data.email.trim().toLowerCase(),
                displayName: data.displayName.trim(),
                role: (data.role || 'USER').trim().toUpperCase(),
                blocked: false,
              })
              .subscribe({
                next: () => this.loadUsers(),
                error: (err) => console.error('Error al crear usuario:', err),
              });

            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async presentEditUserAlert(user: AdminUser) {
    const alert = await this.alertController.create({
      header: 'Editar usuario',
      inputs: [
        { name: 'email', type: 'email', value: user.email, placeholder: 'Email' },
        {
          name: 'displayName',
          type: 'text',
          value: user.displayName,
          placeholder: 'Nombre visible',
        },
        {
          name: 'role',
          type: 'text',
          value: user.role,
          placeholder: 'Rol (USER / ADMIN)',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.email?.trim() || !data.displayName?.trim()) {
              return false;
            }

            this.adminApi
              .updateUser(user.id, {
                email: data.email.trim().toLowerCase(),
                displayName: data.displayName.trim(),
                role: (data.role || user.role).trim().toUpperCase(),
                blocked: user.blocked,
              })
              .subscribe({
                next: () => this.loadUsers(),
                error: (err) => console.error('Error al editar usuario:', err),
              });

            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  toggleBlocked(user: AdminUser) {
    this.adminApi
      .updateUser(user.id, {
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        blocked: !user.blocked,
      })
      .subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Error al cambiar bloqueo:', err),
      });
  }

  async presentDeleteUserAlert(user: AdminUser) {
    const alert = await this.alertController.create({
      header: 'Eliminar usuario',
      message: `¿Seguro que quieres eliminar a "${user.displayName}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.adminApi.deleteUser(user.id).subscribe({
              next: () => {
                this.users = this.users.filter((u) => u.id !== user.id);
                this.updateUserStats();
                this.cdr.detectChanges();
              },
              error: (err) => console.error('Error al eliminar usuario:', err),
            });
          },
        },
      ],
    });

    await alert.present();
  }

  toggleClanMembers(clan: AdminClan) {
    if (this.expandedClanIds.has(clan.id)) {
      this.expandedClanIds.delete(clan.id);
      return;
    }

    this.expandedClanIds.add(clan.id);

    if (!this.expandedClanMembers[clan.id]) {
      this.isLoadingMembers[clan.id] = true;

      this.adminApi.getClanMembers(clan.id).subscribe({
        next: (members) => {
          this.expandedClanMembers[clan.id] = members;
          this.isLoadingMembers[clan.id] = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar miembros:', err);
          this.isLoadingMembers[clan.id] = false;
        },
      });
    }
  }

  isClanExpanded(clanId: string): boolean {
    return this.expandedClanIds.has(clanId);
  }

  async presentEditClanAlert(clan: AdminClan) {
    const alert = await this.alertController.create({
      header: 'Editar clan',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: clan.name,
          placeholder: 'Nombre del clan',
        },
        {
          name: 'status',
          type: 'text',
          value: clan.status,
          placeholder: 'Estado (ACTIVE / INACTIVE)',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.name?.trim()) {
              return false;
            }

            this.adminApi
              .updateClan(clan.id, {
                name: data.name.trim(),
                status: (data.status || clan.status).trim().toUpperCase(),
              })
              .subscribe({
                next: () => this.loadClans(),
                error: (err) => console.error('Error al editar clan:', err),
              });

            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async presentDeleteClanAlert(clan: AdminClan) {
    const alert = await this.alertController.create({
      header: 'Eliminar clan',
      message: `¿Seguro que quieres eliminar "${clan.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.adminApi.deleteClan(clan.id).subscribe({
              next: () => {
                this.clans = this.clans.filter((c) => c.id !== clan.id);
                this.expandedClanIds.delete(clan.id);
                delete this.expandedClanMembers[clan.id];
                this.updateClanStats();
                this.cdr.detectChanges();
              },
              error: (err) => console.error('Error al eliminar clan:', err),
            });
          },
        },
      ],
    });

    await alert.present();
  }

  async presentRemoveMemberAlert(clan: AdminClan, member: AdminClanMember) {
    const alert = await this.alertController.create({
      header: 'Expulsar miembro',
      message: `¿Seguro que quieres expulsar a "${member.displayName}" del clan?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Expulsar',
          role: 'destructive',
          handler: () => {
            this.adminApi.removeClanMember(clan.id, member.userId).subscribe({
              next: () => {
                this.expandedClanMembers[clan.id] =
                  this.expandedClanMembers[clan.id].filter(
                    (m) => m.userId !== member.userId
                  );

                const targetClan = this.clans.find((c) => c.id === clan.id);
                if (targetClan) {
                  targetClan.membersCount = Math.max(0, targetClan.membersCount - 1);
                }

                this.cdr.detectChanges();
              },
              error: (err) => console.error('Error al expulsar miembro:', err),
            });
          },
        },
      ],
    });

    await alert.present();
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl(AuthService.LOGIN_ROUTE, { replaceUrl: true });
  }

  goBackToApp() {
    this.router.navigateByUrl(AuthService.HOME_ROUTE, { replaceUrl: true });
  }
}
