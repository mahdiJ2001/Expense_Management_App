import { Routes } from '@angular/router';
import { RegisterComponent } from '../app/components/register/register.component';
import { LoginComponent } from '../app/components/login/login.component';
import { AppComponent } from '../app/app.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from '../app/components/dashboard/dashboard.component';
import { ExpenseComponent } from './components/expense/expense.component';
import { IncomeComponent } from './components/income/income.component';
import { CategoryComponent } from './components/category/category.component';
import { ExpenseEditComponent } from './components/expense-edit/expense-edit.component';
import { IncomeEditComponent } from './components/income-edit/income-edit.component';
import { UploadExpensesComponent } from './components/upload-expenses/upload-expenses.component';
import { UploadIncomesComponent } from './components/upload-incomes/upload-incomes.component';

export const appRoutes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'expense/edit/:id', component: ExpenseEditComponent, canActivate: [AuthGuard] },
    { path: 'income/edit/:id', component: IncomeEditComponent, canActivate: [AuthGuard] },
    { path: 'expense', component: ExpenseComponent, canActivate: [AuthGuard] },
    { path: 'income', component: IncomeComponent, canActivate: [AuthGuard] },
    { path: 'categories', component: CategoryComponent, canActivate: [AuthGuard] },
    { path: 'expenses/upload', component: UploadExpensesComponent, canActivate: [AuthGuard] },
    { path: 'incomes/upload', component: UploadIncomesComponent, canActivate: [AuthGuard] },
];

export default appRoutes;
