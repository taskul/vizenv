class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
        this.prev = null;
    }
}

class UserCmdStore {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
        this.idx = 0;
    }

    add(value) {
        const node = new Node(value);
        if (!this.head) {
            this.head = node;
            this.tail = node;
        } else {
            node.prev = this.tail;
            this.tail.next = node;
            this.tail = node;
        }
        this.length += 1;
        this.idx += 1;
    }
    idxGetter(idx) {
        let current = this.tail;
        let count = this.length - 1;
        while (current !== null && count !== idx) {
            count -=1;
            current = current.prev;
        }
        return current;
    }

    prevCmd() {
        if (!this.tail) {
            return null;
        }
        if (this.idx < 0) {
            return null;
        }

        this.idx -= 1;
        let cmd = this.idxGetter(this.idx);
        if (cmd === null) {
            return null;
        }
        return cmd.value;
    }

    nextCmd() {
        if (!this.tail) {
            return null;
        }
        if (this.idx === this.length) {
            return null;
        }

        this.idx += 1;
        let cmd = this.idxGetter(this.idx);
        if (cmd === null) {
            return null;
        }
        return cmd.value;
    }
}

module.exports = UserCmdStore;