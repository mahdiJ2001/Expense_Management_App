import { Component, OnInit, AfterViewInit } from '@angular/core';
import Chart, { ChartConfiguration } from 'chart.js/auto';
import { CategoryScale } from 'chart.js';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CategoryService } from '../../services/category.service';
import { IncomeService } from '../../services/income.service';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { MatIcon } from '@angular/material/icon';

Chart.register(CategoryScale);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [MatCardModule, CommonModule, MatFormFieldModule, MatSelectModule, MatIcon]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  balance: number = 0;
  income: number = 0;
  expense: number = 0;
  chartTitle: string = 'Expense Chart';;

  latestExpense = {
    amount: 0,
    date: new Date(),
    category: ''
  };

  latestIncome = {
    amount: 0,
    date: new Date(),
    category: ''
  };

  minExpense = {
    amount: 0,
    date: new Date(),
    category: ''
  };

  maxExpense = {
    amount: 0,
    date: new Date(),
    category: ''
  };

  minIncome = {
    amount: 0,
    date: new Date(),
    category: ''
  };

  maxIncome = {
    amount: 0,
    date: new Date(),
    category: ''
  };

  private expenseChart: Chart | undefined;
  private incomeChart: Chart | undefined;
  isMerged: boolean = false;

  private categoryMap: { [key: number]: string } = {};


  constructor(
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    this.loadCharts();
  }

  private loadDashboardData(): void {
    const userId = this.authService.getUserId();

    if (userId) {
      this.categoryService.getAllCategories().subscribe(categories => {
        this.categoryMap = categories.reduce((map, category) => {
          map[category.id] = category.name;
          return map;
        }, {});

        this.incomeService.getAllIncomes().subscribe(incomes => {
          this.income = incomes.reduce((total, income) => total + income.amount, 0);
          this.latestIncome = this.getLatest(incomes);
          this.minIncome = this.getMin(incomes);
          this.maxIncome = this.getMax(incomes);
        });

        this.expenseService.getAllExpenses().subscribe(expenses => {
          this.expense = expenses.reduce((total, expense) => total + expense.amount, 0);
          this.latestExpense = this.getLatest(expenses);
          this.minExpense = this.getMin(expenses);
          this.maxExpense = this.getMax(expenses);
          this.balance = this.income - this.expense;
        });
      });
    } else {
      console.error('User not logged in');
    }
  }





  private getLatest(items: any[]): any {
    return items.reduce((latest, item) => new Date(item.date) > new Date(latest.date) ? this.assignCategory(item) : latest, this.assignCategory(items[0]));
  }

  private getMin(items: any[]): any {
    return items.reduce((min, item) => item.amount < min.amount ? this.assignCategory(item) : min, this.assignCategory(items[0]));
  }

  private getMax(items: any[]): any {
    return items.reduce((max, item) => item.amount > max.amount ? this.assignCategory(item) : max, this.assignCategory(items[0]));
  }

  private assignCategory(item: any): any {
    return {
      ...item,
      category: this.categoryMap[item.categoryId] || 'Unknown'
    };
  }

  private createExpenseChart(scale: 'days' | 'weeks' | 'months'): void {
    const ctx = document.getElementById('expenseChart') as HTMLCanvasElement;

    if (ctx) {
      this.expenseService.getAllExpenses().subscribe(expenses => {
        const { labels, data } = this.transformData(expenses, scale);

        const chartData = {
          labels: labels,
          datasets: [{
            label: 'Expense Dataset',
            data: data,
            fill: false,
            borderColor: 'rgb(255, 0, 0)',
            tension: 0.1
          }]
        };

        if (this.expenseChart) {
          this.expenseChart.destroy();
        }

        const config: ChartConfiguration<'line', number[], string> = {
          type: 'line',
          data: chartData
        };

        this.expenseChart = new Chart(ctx, config);
      });
    }
  }

  private createIncomeChart(scale: 'days' | 'weeks' | 'months'): void {
    const ctx = document.getElementById('incomeChart') as HTMLCanvasElement;

    if (ctx) {
      this.incomeService.getAllIncomes().subscribe(incomes => {
        const { labels, data } = this.transformData(incomes, scale);

        const chartData = {
          labels: labels,
          datasets: [{
            label: 'Income Dataset',
            data: data,
            fill: false,
            borderColor: 'rgb(0, 128, 0)',
            tension: 0.1
          }]
        };

        if (this.incomeChart) {
          this.incomeChart.destroy();
        }

        const config: ChartConfiguration<'line', number[], string> = {
          type: 'line',
          data: chartData
        };

        this.incomeChart = new Chart(ctx, config);
      });
    }
  }

  private transformData(items: any[], scale: 'days' | 'weeks' | 'months'): { labels: string[], data: number[] } {
    const labels: string[] = [];
    const data: number[] = [];
    const groupedData: { [key: string]: number } = {};

    items.forEach(item => {
      const date = new Date(item.date);
      let label: string;

      switch (scale) {
        case 'days':
          label = date.toLocaleDateString();
          break;
        case 'weeks':
          label = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
          break;
        case 'months':
          label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          break;
      }

      if (!groupedData[label]) {
        groupedData[label] = 0;
      }
      groupedData[label] += item.amount;
    });

    for (const [label, amount] of Object.entries(groupedData)) {
      labels.push(label);
      data.push(amount);
    }

    return { labels, data };
  }


  private loadCharts(): void {
    if (this.isMerged) {
      this.mergeCharts();
    } else {
      this.createExpenseChart('days');
      this.createIncomeChart('days');
    }
  }

  private createMergedChart(scale: 'days' | 'weeks' | 'months'): void {
    const ctxExpense = document.getElementById('expenseChart') as HTMLCanvasElement;
    const ctxIncome = document.getElementById('incomeChart') as HTMLCanvasElement;

    if (ctxExpense && ctxIncome) {
      this.expenseService.getAllExpenses().subscribe(expenses => {
        this.incomeService.getAllIncomes().subscribe(incomes => {
          const expenseData = this.transformData(expenses, scale);
          const incomeData = this.transformData(incomes, scale);

          const chartData = {
            labels: expenseData.labels,
            datasets: [
              {
                label: 'Expense Dataset',
                data: expenseData.data,
                fill: false,
                borderColor: 'rgb(255, 0, 0)',
                tension: 0.1
              },
              {
                label: 'Income Dataset',
                data: incomeData.data,
                fill: false,
                borderColor: 'rgb(0, 128, 0)',
                tension: 0.1
              }
            ]
          };


          if (this.expenseChart) {
            this.expenseChart.destroy();
          }

          if (this.incomeChart) {
            this.incomeChart.destroy();
          }

          const config: ChartConfiguration<'line', number[], string> = {
            type: 'line',
            data: chartData,
          };

          this.expenseChart = new Chart(ctxExpense, config);
          this.incomeChart = new Chart(ctxIncome, config);

        });
      });
    }
  }



  toggleMergeCharts(): void {
    this.isMerged = !this.isMerged;
    const scale: 'days' | 'weeks' | 'months' = 'days';

    if (this.isMerged) {
      this.createMergedChart(scale);
      document.getElementById('incomeChartContainer')!.style.display = 'none';
      this.chartTitle = 'Expense & Income Chart';
    } else {
      this.loadCharts();
      document.getElementById('incomeChartContainer')!.style.display = 'block';
      this.chartTitle = 'Expense Chart';
    }
  }

  onScaleChange(scale: 'days' | 'weeks' | 'months', chartType: 'income' | 'expense'): void {
    if (this.isMerged) {
      this.createMergedChart(scale);
    } else {
      if (chartType === 'expense') {
        this.createExpenseChart(scale);
      } else if (chartType === 'income') {
        this.createIncomeChart(scale);
      }
    }
  }


  private mergeCharts(): void {
    const ctx = document.getElementById('expenseChart') as HTMLCanvasElement;
    const incomeChartContainer = document.getElementById('incomeChartContainer');

    if (ctx && incomeChartContainer) {
      this.expenseService.getAllExpenses().subscribe(expenses => {
        this.incomeService.getAllIncomes().subscribe(incomes => {
          const scale = 'days';
          const { labels: expenseLabels, data: expenseData } = this.transformData(expenses, scale);
          const { labels: incomeLabels, data: incomeData } = this.transformData(incomes, scale);


          const mergedLabels = Array.from(new Set([...expenseLabels, ...incomeLabels]));
          mergedLabels.sort();


          const mergedExpenseData = mergedLabels.map(label => {
            const index = expenseLabels.indexOf(label);
            return index !== -1 ? expenseData[index] : 0;
          });

          const mergedIncomeData = mergedLabels.map(label => {
            const index = incomeLabels.indexOf(label);
            return index !== -1 ? incomeData[index] : 0;
          });


          const chartData = {
            labels: mergedLabels,
            datasets: [
              {
                label: 'Expense Dataset',
                data: mergedExpenseData,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
              },
              {
                label: 'Income Dataset',
                data: mergedIncomeData,
                fill: false,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
              }
            ]
          };


          if (this.expenseChart) {
            this.expenseChart.destroy();
          }


          incomeChartContainer.style.display = 'none';


          const config: ChartConfiguration<'line', number[], string> = {
            type: 'line',
            data: chartData,

          };

          this.expenseChart = new Chart(ctx, config);
          this.chartTitle = 'Expense & Income Chart';
        });
      });
    }
  }




  private unmergeCharts(): void {
    const incomeChartContainer = document.getElementById('incomeChartContainer');
    if (incomeChartContainer) {
      incomeChartContainer.style.display = 'block';
    }

    this.createExpenseChart('days');
    this.createIncomeChart('days');

  }

}
