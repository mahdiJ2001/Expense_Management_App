import { Category } from './category.model';

export class User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: number;
    categories: Category[];

    constructor(id: number, firstName: string, lastName: string, email: string, phone: number, categories: Category[]) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.categories = categories;
    }
}
