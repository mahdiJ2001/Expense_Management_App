

export class Income {
    id: number;
    amount: number;
    categoryId: number;
    date: Date;
    note: string;
    user?: { id: number };

    constructor(
        id: number,
        amount: number,
        categoryId: number,
        date: Date,
        note: string,
        user?: { id: number }
    ) {
        this.id = id;
        this.amount = amount;
        this.categoryId = categoryId;
        this.date = date;
        this.note = note;
        this.user = user;
    }
}
