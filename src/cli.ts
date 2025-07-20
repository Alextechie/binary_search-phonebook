import { ContactBST } from "./contactBST";
import inquirer from "inquirer";
import { csvFileSync } from "./csvfileSync";
import fs from "fs";
import { file } from "bun";
import { fuzzyScore, isValidPhoneNumber, isVlidName, searchContacts } from "../utils/lib";
import { SocketAddress } from "net";
const phonebook = new ContactBST();



async function main() {
    while (true) {
        const menu = await inquirer.prompt([
            {
                type: "rawlist",
                name: 'action',
                message: 'What action do you want to perform?',
                choices: ['Add contact', 'Search by name', 'Export to CSV', 'search', 'Import from csv', 'Delete', 'Autocomplete', 'View all', 'Edit contact', 'Exit']
            },
        ])

        switch (menu.action) {
            case 'Add contact':
                // promp the user for a name then a number
                const contact = await inquirer.prompt([
                    {
                        type: "input",
                        name: "contact_name",
                        message: "Enter contact name",
                        validate: (name: string) => {
                            return isVlidName(name) || "Name must only contain letters and atleast 2 characters"
                        }
                    },
                    {
                        type: "input",
                        name: "phone_number",
                        message: "Enter phone number",
                        validate: (phone: string) => {
                            return isValidPhoneNumber(phone) || "Phone number must be atleast 10 digits and should only contain numbers"
                        }
                    },
                ])

                // take the values and insert into the binary search tree contact
                phonebook.insert(contact.contact_name, contact.phone_number);
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

            case 'search':
                // ask the user for input
                const input = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'name',
                        message: 'Contact name'
                    }
                ]);

                // convert the input to lower case
                const input_name = String(input.name).toLowerCase();

                let resultes: {name: string, score: number}[] = []



                // iterate over all the contacts and for each contact extract and convert to lowercase for comparison.
                for (const c of phonebook) {
                    const contact_name = c.name.toLowerCase();
                    let score = fuzzyScore(input_name, contact_name);

                    if(score > 0) resultes.push({name: c.name, score});
                }

                // sort the results and find the matches
                resultes.sort((a, b) => b.score - a.score);
                
                console.log('\n Best Matches')
                for(const {name, score} of resultes.slice(0, 10)){
                    console.log(`${name} -- score: ${score}`)
                }

                break

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

            case 'Export to CSV':
                const filename = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'file',
                        message: "Enter file name to export(e.g contacts.csv)"
                    }
                ])

                const outputFile = filename.file.endsWith('csv') ? filename.file : filename.file + '.csv';

                const lines = ["names,phone"]

                // traverse the tree
                for (const contact of phonebook) {
                    const line = `${contact.name},${contact.phone}`
                    lines.push(line)
                }

                fs.writeFileSync(outputFile, lines.join('\n'), "utf-8");
                console.log(`Exported ${lines.length - 1} contacts to ${outputFile}`)

                break;

            case 'Import from csv':
                // prompt the user to enter the filename 
                const file = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'filename',
                        message: 'Enter file to import to (e.g contacts.csv)'
                    }
                ])

                const outputfile = file.filename.endsWith('csv') ? file.filename.trim() : file.filename.trim() + '.csv'.trim();

                let results = [];

                // read through the csv file and store the results onto memory
                try {
                    const contacts = fs.readFileSync(outputfile, 'utf-8');

                    if (contacts.length === 0) {
                        console.log('File is empty');
                        break;
                    }

                    const lines = contacts.split('\n')

                    // for (let i = 0; i < lines.length; i++) {
                    //     const [name, phone] = lines[i]!.split(',');
                    //     if(!name || !phone) continue
                    //     results.push([name?.trim(), phone?.trim()]);
                    // }


                    for (let i = 0; i < lines.length; i++) {
                        const [rawName, rawPhone] = lines[i]!.split(",");
                        const name = rawName?.trim();
                        const phone = rawPhone?.trim();


                        if (!name || !phone) {
                            console.log(`Skipping line ${i + 1}: missing name or phone number`);
                            continue;
                        }

                        if (!isVlidName(name)) {
                            console.log(`Skipping line ${i + 1}. Invalid name "${name}"`);
                            continue;
                        }

                        if (!isValidPhoneNumber(phone)) {
                            console.log(`Skipping line ${i + 1}. Invalid phone number "${phone}"`);
                        }

                        results.push([name, phone])
                    }


                    for (const [name, phone] of results) {
                        // check if the contact exists
                        const exists = phonebook.search(name as string);

                        if (exists) {
                            // ask the user what to do
                            const options = await inquirer.prompt([
                                {
                                    type: 'rawlist',
                                    name: 'actions',
                                    message: 'What action do you want to perform? ',
                                    choices: ['Override', 'ignore', 'rename']
                                }
                            ])

                            switch (options.actions) {
                                case 'Override':
                                    // overwrite the current contact
                                    phonebook.edit(name as string, phone as string)
                                    break;

                                case 'ignore':
                                    break;

                                case 'rename':
                                    // get a new name for the user
                                    const contactName = await inquirer.prompt([
                                        {
                                            type: 'input',
                                            name: 'name',
                                            message: 'New name'
                                        }
                                    ])

                                    phonebook.edit(exists.name, phone as string, contactName.name)
                            }

                        } else {
                            phonebook.insert(name as string, phone as string);
                        }
                    }

                    console.log(`Exported ${results.length - 1} from ${file.filename}`)

                } catch (err) {
                    console.log(`file ${outputfile} does not exist`);
                    console.log(`Error: ${err}`)
                }
                break

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