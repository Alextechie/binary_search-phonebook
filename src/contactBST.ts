import { ContactNode } from "./contactNode";


export class ContactBST {
    root: ContactNode | null = null;

    insert(name: string, phone: string): void {
        const newContact = new ContactNode(name, phone);

        if (!this.root) {
            this.root = newContact;
            return;
        }

        // check if the value of the name is less than the current(root)
        let current = this.root;
        while (true) {
            if (name.toLowerCase() < current.name) {
                if (!current.left) {
                    current.left = newContact
                    return;
                }

                // move to the next node in the left subtree
                current = current.left
            }

            else if (name.toLowerCase() > current.name) {
                // insert the node in the right subtree
                if (!current.right) {
                    current.right = newContact;
                    return;
                }

                // move to the next node in the subtree
                current = current.right;
            } else {
                console.log(`Conatact: ${name} already exists`)
            }
        }
    }

    search(name: string): ContactNode | null {
        // check if the tree has no nodes
        let current = this.root;

        name = name.toLowerCase();

        while (current) {
            // check if the inserted name matches the current name in the tree
            if (name === current.name) return current
            current = name < current.name ? current.left : current.right
        }

        return null;
    }

    // actaul deletion of the node
    delete(name: string): void {
        this._delete(this.root, name.toLowerCase())
    }

    // deleting a node form a tree(deleting a contact)
    private _delete(node: ContactNode | null, name: string): ContactNode | null {
        if (!node) return null;

        // check if the name has a lower value than the current name
        if (name < node.name) {
            node.left = this._delete(node.left, name)
        } else if (name > node.name) {
            node.right = this._delete(node.right, name);
        } else {
            // Found the node to delete
            if (!node.left && !node.right) return null;

            // if there is no node in the left then there is a node on the right subtree
            if (!node.right) return node.left;
            if (!node.left) return node.right;

            // find the max value in the left subtree: Two children find max in the left subtree
            const maxLeft = this._findMax(node.left);
            node.name = maxLeft.name;
            node.phone = maxLeft.phone;
            node.left = this._delete(node.left, maxLeft.name);
        }

        return node
    }

    // find the minValue in the right subtree: going to use it in the delete method
    private _findMax(node: ContactNode): ContactNode {
        while (node.right) node = node.right;
        return node;
    }



    inOrder(node = this.root): void {
        if (!node) return;

        // visit the left subtree using depth -- then the root/parent node -- then the right subtree
        this.inOrder(node.left);
        console.log(`${node.name} -- ${node.phone}`)
        this.inOrder(node.right)
    }

    // add method for editing a phone number in a contactList/ we are editing contents of the node
    edit(name: string, phone: string, newName?: string) {
        // search for the contact using the name.
        // get the phone number from that node
        // edit the contents of that phone number

        const contact = this.search(name);
        if (!contact) return;
        if(!newName) contact.name = name
        contact.name = newName!
        contact.phone = phone;
    }

    autoComplete(prefix: string): { name: string, phone: string }[] {
        const results: { name: string, phone: string }[] = [];

        const searchPrefix = (node: ContactNode | null): void => {
            if (!node) return;

            // if the current's node is less search the right
            if (node.name < prefix){
                searchPrefix(node.right)
            } 
            // if the current's node is greater search the left
            else if (node.name > prefix){
                searchPrefix(node.left);

                // check if the name prefix matches the ones in the tree
                if(node.name.startsWith(prefix)){
                    results.push({name: node.name, phone: node.phone});
                    searchPrefix(node.right)
                }
            }
            // case for when the node matches or starts with the prefix
            else {
                // if node.name matches or starts with the prefx
                if(node.name.startsWith(prefix)){
                    results.push({name: node.name, phone: node.phone});
                }

                // recursing both the left and right subtrees because they may be deep in the tree
                searchPrefix(node.left)
                searchPrefix(node.right)
            }
        };

        searchPrefix(this.root);
        return results
    }

    // // add iterator support
    *[Symbol.iterator](): IterableIterator<{name: string, phone: string}>{
        // when the node is used as a type in parameter it has to be called/yield at the end of the function with the actual value of the parameter
        function* inOrderGen(node: ContactNode | null): Generator<{name: string, phone: string}>{
            if(!node) return;
            yield* inOrderGen(node.left);
            yield {name: node.name, phone: node.phone}
            yield* inOrderGen(node.right)
        }

        yield* inOrderGen(this.root)
    }

}