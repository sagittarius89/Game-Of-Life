let operations =
{
    "equals": (lparam, rparam) => {
        return lparam == rparam;
    },
    "less": (lparam, rparam) => {
        return lparam < rparam;
    },
    "greater": (lparam, rparam) => {
        return lparam > rparam;
    }
};

let isCenter = (matrix, cursor, i = 0) => {
    if (i < cursor.length) {

        if (cursor[i] == Math.floor(matrix.length / 2))
            return isCenter(matrix, cursor, ++i);
        else
            return false;
    }

    return true;
}

let rules = {
    "neighbourCount": (matrix, rule, game, dCount) => {
        let cursor = new Array(dCount);
        let counter = 0;

        cursor.fill(0);

        do {
            if (game.get(cursor, matrix)) {
                if (!isCenter(matrix, cursor))
                    counter++;
            }
        } while (!game.incrementCursor(cursor, matrix.length));

        return operations[rule.operation](counter, rule.value);
    },
    "operator": (matrix, rule, game, dCount) => {
        return rule.value;
    }
}

let actions = {
    "none": (matrix, rule, game, dCount, cell) => {
        return cell;
    },

    "create": (matrix, rule, game, dCount, cell) => {
        //let cursor = new Array(dCount);
        //cursor.fill(0);
        //while (!game.incrementCursor(cursor, Math.floor(matrix.length / 2))) { };

        //game.set(cursor, 1, matrix);

        return 1;
    },

    "delete": (matrix, rule, game, dCount, cell) => {
        //let cursor = new Array(dCount);
        //cursor.fill(0);
        //while (!game.incrementCursor(cursor, Math.floor(matrix.length / 2))) { };

        //game.set(cursor, 0, matrix);

        return 0;
    }
}