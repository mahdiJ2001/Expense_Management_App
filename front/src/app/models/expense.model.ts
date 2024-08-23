import { Category } from './category.model';

export class Expense {
    id: number;
    amount: number;
    categoryId: number;
    date: Date;
    note: string;

    constructor(id: number, amount: number, categoryId: number, date: Date, note: string) {
        this.id = id;
        this.amount = amount;
        this.categoryId = categoryId;
        this.date = date;
        this.note = note;
    }
}
