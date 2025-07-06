import { ContactBST } from "./contactBST";

const contactList = new ContactBST();

contactList.insert("Alex", "0769396362");
contactList.insert("Mercy", "0720001347");
contactList.insert("Mariam", "0750451257")
contactList.insert("Miriam", "01344445567")

// console.log(contactList.inOrder());

// edit a contact
contactList.edit("Alex", "0750451257", "Al");
// console.log(contactList.inOrder())

// autocomplete based on the prefix
// console.log(contactList.autoComplete("m"))

// iterating over all the contacts
console.log("Iterating over all the contacts")
for(const contact  of contactList){
    console.log(`${contact.name} -- ${contact.phone}`)
}