import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    RouterModule
  ]
})
export class AppComponent implements OnInit {
  title = 'expense-management-front';
  isCollapsed = false;
  isLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  userFirstName: string = '';
  userLastName: string = '';

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {

    this.authService.userDetails$.subscribe(user => {
      if (user) {
        this.isLoggedIn$.next(true);
        this.userFirstName = user.firstName;
        this.userLastName = user.lastName;
      } else {
        this.isLoggedIn$.next(false);
      }
    });

    if (this.authService.isLoggedIn()) {
      const userId = this.authService.getUserId();
      if (userId) {
        this.authService.fetchUserDetails(userId).subscribe();
      }
    }
  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isAuthPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/register';
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
