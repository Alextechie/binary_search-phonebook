export class ContactNode {
    name: string;
    phone: string;
    left: ContactNode | null = null;
    right: ContactNode | null = null;

    constructor(name: string, phone: string){
        this.name = name.toLowerCase();
        this.phone = phone
    }
}