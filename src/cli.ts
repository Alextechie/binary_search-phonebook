import { ContactBST } from "./contactBST";
import inquirer from "inquirer";

const phonebook = new ContactBST();



async function main() {
    while (true) {
        const menu = await inquirer.prompt([
            {
                type: "rawlist",
                name: 'action',
                message: 'What action do you want to perform',
                choices: ['Add contact', 'Search by name', 'Delete', 'Autocomplete', 'View all', 'Edit contact', 'Exit']
            },
        ])

        switch (menu.action) {
            case 'Add contact':
                // promp the user for a name then a number
                const contact = await inquirer.prompt([
                    {
                        type: "input",
                        name: "contact_name",
                        message: "Enter contact name"
                    },
                    {
                        type: "input",
                        name: "phone_number",
                        message: "Enter phone number"
                    },
                ])

                // take the values and insert into the binary search tree contact
                phonebook.insert(contact.contact_name, contact.phone_number)
                break;

            case 'Search by name':
                // get the contact name from user
                const name = await inquirer.prompt([
                    {
                        type: "input",
                        name: "contact_name",
                        message: "Enter contact name"
                    },
                ])


                // search for the contact in the contact name and return
                const user = phonebook.search(name.contact_name);
                if (user) {
                    console.log(`${user.name}: ${user.phone}`)
                } else {
                    console.log('Contact not found')
                }
                break;

            case 'Delete':
                // ask for the contact name
                // confirm with the user
                // delete the contact

                const contact_info = await inquirer.prompt([
                    {
                        type: "input",
                        name: "contact_name",
                        message: "Enter contact name"
                    },
                ])

                // confirm whether the user wants to delete the contact
                const confirmation = await inquirer.prompt([
                    {
                        type: "confirm",
                        name: "confirm_delete",
                        message: `Are you sure you want to delete ${contact_info.contact_name}?`
                    }
                ])

                if (confirmation.confirm_delete) {
                    phonebook.delete(contact_info.contact_name);
                    console.log("Contact deleted")
                }

                break;

            // after deleting a contact print the remaining list

            case 'Autocomplete':
                // get contact name input
                const prefix = await inquirer.prompt([
                    {
                        type: "input",
                        name: "prefix_str",
                        message: "Type a contact name"
                    }
                ]);

                // return the contacts with the typed prefix
                const matches = phonebook.autoComplete(prefix.prefix_str)

                for (const c of matches) {
                    console.log(`${c.name}: ${c.phone}`)
                }

                break;

            case 'View all':
                if (phonebook.root === null) {
                    console.log("No contacts to display")
                } else {
                    // iterate over all the contacts in the tree
                    for (const contact of phonebook) {
                        console.log(contact)
                    }
                }


                break;

            case 'Edit contact':
                // get the name from user and search for the name 
                const edit = await inquirer.prompt([
                    {
                        type: "input",
                        name: "name",
                        message: "Enter the name of the contact you want to edit"
                    },
                    {
                        type: "input",
                        name: "phone",
                        message: "Edit phone number"
                    },
                    {
                        type: "input",
                        name: "name_edit",
                        message: "Enter new name"
                    },
                ])

                const contact_detail = phonebook.search(edit.name);
                if (!contact_detail) {
                    console.log("Contact name not found")
                } else {
                    phonebook.edit(contact_detail.name, edit.phone, edit.name_edit)
                }

                break;

            case 'Exit':
                console.log("Goodbye 👋")
                return;
        }
    }
}

main()